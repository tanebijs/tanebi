import { Socket } from 'node:net';
import { BUF0 } from '@/core/util/constants';
import { BotContext } from '@/core';
import { Mutex } from 'async-mutex';
import { LogicBase } from '@/core/logic/LogicBase';
import { IncomingSsoPacket } from '@/core/logic/SsoPacketLogic';
import { clearTimeout } from 'node:timers';
import { SmartBuffer } from 'smart-buffer';

const host = 'msfwifi.3g.qq.com';
const port = 8080;

export class NetworkLogic extends LogicBase {
    connected = false;
    socket = new Socket();
    private buf = BUF0;
    private pending = new Map<number, (incoming: IncomingSsoPacket) => unknown>();

    private outgoingDataMutex = new Mutex();
    private incomingDataMutex = new Mutex();
    private handlePacketMutex = new Mutex();

    constructor(public ctx: BotContext) {
        super(ctx);

        this.socket.on('close', () => {
            this.buf = BUF0;
            if (this.connected) {
                this.connected = false;
            }
        });

        this.socket.on('data', chunk => {
            this.handleDataChunk(chunk);
        });
    }

    connectToMsfServer() {
        return new Promise<void>((resolve, reject) => {
            const _reject: (reason: Error) => void = err => reject(err);
            this.socket.once('error', _reject);
            this.socket.connect(port, host, () => {
                this.socket.removeListener('error', _reject);
                resolve();
            });
        });
    }

    /**
     * Send an SSO packet to the server and wait for the response
     * @param cmd Command
     * @param src Source buffer, or packet body
     * @param seq Sequence number
     * @param timeout Timeout in milliseconds
     */
    sendSsoPacket(cmd: string, src: Buffer, seq: number, timeout: number = 5000): Promise<IncomingSsoPacket> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const packet = await this.ctx.ssoPacketLogic.buildSsoPacket(cmd, src, seq);
            const timer = setTimeout(() => {
                this.handlePacketMutex.runExclusive(() => {
                    this.pending.delete(seq);
                });
                reject(new Error(`Timeout for SSO packet seq=${seq}`));
            }, timeout);

            this.handlePacketMutex.runExclusive(() => {
                this.pending.set(seq, incoming => {
                    this.handlePacketMutex.runExclusive(() => {
                        this.pending.delete(seq);
                    });
                    clearTimeout(timer);
                    resolve(incoming);
                });
            });

            this.outgoingDataMutex.runExclusive(() => {
                this.socket.write(new SmartBuffer()
                    .writeUInt32BE(packet.length + 4)
                    .writeBuffer(packet)
                    .toBuffer());
            });
        });
    }

    private handlePacket(packet: Buffer) {
        try {
            const resolved = this.ctx.ssoPacketLogic.resolveIncomingSsoPacket(packet);
            const seq = resolved.sequence;
            if (this.pending.has(seq)) {
                this.handlePacketMutex.runExclusive(() => {
                    const callback = this.pending.get(seq)!;
                    callback(resolved);
                    this.pending.delete(seq);
                });
            } else {
                // TODO: handle server-side packet
            }
        } catch {
            // TODO: handle error
        }
    }

    private handleDataChunk(chunk: Buffer) {
        this.incomingDataMutex.runExclusive(async () => {
            this.buf = this.buf.length === 0 ? chunk : Buffer.concat([this.buf, chunk]);
            while (this.buf.length > 4) {
                const len = this.buf.readUInt32BE();
                if (this.buf.length >= len) {
                    const packet = this.buf.subarray(4, len);
                    this.buf = this.buf.subarray(len);
                    this.handlePacket(packet);
                } else {
                    break;
                }
            }
        });
    }
}