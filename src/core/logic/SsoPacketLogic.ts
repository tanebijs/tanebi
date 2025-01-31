import { LogicBase } from '@/core/logic/LogicBase';
import { BUF16 } from '@/core/util/constants';
import { SsoReserveFields } from '@/core/packet/common/SsoReserveFields';
import { generateTrace } from '@/core/util/format';
import {
    OutgoingSsoPacket,
    OutgoingSsoPacketHeader,
    OutgoingSsoPacketWrapper,
} from '@/core/packet/common/OutgoingSsoPacket';
import {
    CompressionType,
    EncryptionType,
    IncomingSsoPacket,
    IncomingSsoPacketHeader,
    IncomingSsoPacketWrapper,
} from '@/core/packet/common/IncomingSsoPacket';
import { decryptTea, encryptTea } from '@/core/util/crypto/tea';
import { unzipSync } from 'node:zlib';

const bytes3_Default = Buffer.from('020000000000000000000000', 'hex');
const BUF_0x00_0x00_0x00_0x04 = Buffer.from('00000004', 'hex');

export type IncomingSsoPacket = {
    command: string;
    sequence: number;
} & ({
    body: Buffer; // retcode = 0;
} | {
    retcode: number;
    extra: string;
})

export class SsoPacketLogic extends LogicBase {
    async buildSsoPacket(cmd: string, src: Buffer, seq: number = 0) {
        const sign = await this.ctx.signProvider.sign(cmd, src, seq);
        const packet = OutgoingSsoPacket.encode({
            header: OutgoingSsoPacketHeader.encode({
                sequence: seq,
                subAppId: this.ctx.appInfo.SubAppId,
                locale: 2052,
                bytes3: bytes3_Default,
                tgt: this.ctx.keystore.session.tgt,
                command: cmd,
                bytes6: BUF_0x00_0x00_0x00_0x04,
                guid: this.ctx.deviceInfo.guid.toString('hex'),
                bytes8: BUF_0x00_0x00_0x00_0x04,
                version: this.ctx.appInfo.CurrentVersion,
                ssoReserveFields: Buffer.from(SsoReserveFields.encode({
                    uid: this.ctx.keystore.uid,
                    secureInfo: sign, // may be empty
                    traceParent: generateTrace(),
                })),
            }),
            body: src,
        });

        return OutgoingSsoPacketWrapper.encode({
            protocol: 12,
            encryptionType: this.ctx.keystore.session.d2.length > 0 ?
                EncryptionType.TeaByD2Key :
                EncryptionType.TeaByEmptyKey,
            d2: this.ctx.keystore.session.d2,
            flag3: 0,
            uin: this.ctx.keystore.uin.toString(),
            encrypted: encryptTea(packet, this.ctx.keystore.session.d2Key),
        });
    }

    resolveIncomingSsoPacket(packet: Buffer): IncomingSsoPacket {
        const wrapped = IncomingSsoPacketWrapper.decode(packet);
        if (wrapped.protocol !== 12) {
            throw new Error(`Unsupported protocol: ${wrapped.protocol}`);
        }

        let decrypted: Buffer;
        if (wrapped.encryptionType === EncryptionType.None) {
            decrypted = wrapped.packet;
        } else if (wrapped.encryptionType === EncryptionType.TeaByD2Key) {
            decrypted = decryptTea(wrapped.packet, this.ctx.keystore.session.d2Key);
        } else if (wrapped.encryptionType === EncryptionType.TeaByEmptyKey) {
            decrypted = decryptTea(wrapped.packet, BUF16);
        } else {
            throw new Error(`Unsupported encryption type: ${wrapped.encryptionType}`);
        }

        const unwrapped = IncomingSsoPacket.decode(decrypted);
        const header = IncomingSsoPacketHeader.decode(unwrapped.header);
        if (header.retcode !== 0) {
            return {
                command: header.command,
                sequence: header.sequence,
                retcode: header.retcode,
                extra: header.extra,
            };
        } else {
            let body;

            if (header.compressionType === CompressionType.None || header.compressionType === CompressionType.None_2) {
                body = unwrapped.raw;
            } else if (header.compressionType === CompressionType.Zlib) {
                body = unzipSync(unwrapped.raw);
            } else {
                throw new Error(`Unsupported compression type: ${header.compressionType}`);
            }

            return {
                command: header.command,
                sequence: header.sequence,
                body,
            };
        }
    }
}