import { OneBotApp } from '@app/index';
import { OneBotRecvSegment } from '@app/message/segment';
import { encodeForwardId } from '@app/message/transform/forward';
import { DispatchedMessageBody, MessageType } from 'tanebi';

export async function transformRecvMessage(
    ctx: OneBotApp,
    type: MessageType,
    peerUin: number,
    msg: DispatchedMessageBody,
    repliedSequence?: number,
): Promise<OneBotRecvSegment[]> {
    let repliedId: number | undefined;
    if (repliedSequence) {
        const replied = await ctx.storage.getByPeerAndSequence(type, peerUin, repliedSequence);
        if (replied) {
            repliedId = replied.id;
        }
    }
    const segments = transformRecvMessageBody(msg);
    if (repliedId) {
        segments.unshift({
            type: 'reply',
            data: {
                id: repliedId,
            }
        });
    }
    return segments;
}

function transformRecvMessageBody(
    msg: DispatchedMessageBody,
): OneBotRecvSegment[] {
    if (msg.type === 'bubble') {
        return msg.content.segments.map<OneBotRecvSegment>((s) => {
            if (s.type === 'text') {
                return { type: 'text', data: { text: s.content } };
            } else if (s.type === 'mention') {
                return { type: 'at', data: { qq: s.mentioned.uin } };
            } else if (s.type === 'mentionAll') {
                return { type: 'at', data: { qq: 'all' } };
            } else if (s.type === 'image') {
                return {
                    type: 'image',
                    data: {
                        file: s.content.url,
                        url: s.content.url,
                        sub_type: s.content.subType,
                        summary: s.content.summary,
                    },
                };
            } else {
                // s.type === 'face'
                return { type: 'face', data: { id: '' + s.faceId } };
            }
        });
    } else if (msg.type === 'image') {
        return [
            {
                type: 'image',
                data: {
                    file: msg.content.url,
                    url: msg.content.url,
                    sub_type: msg.content.subType,
                    summary: msg.content.summary,
                },
            },
        ];
    } else if (msg.type === 'record') {
        return [
            {
                type: 'record',
                data: {
                    file: msg.content.url,
                    url: msg.content.url,
                },
            },
        ];
    } else if (msg.type === 'video') {
        return [
            {
                type: 'video',
                data: {
                    file: msg.content.url,
                    url: msg.content.url,
                },
            },
        ];
    } else if (msg.type === 'forward') {
        return [
            {
                type: 'forward',
                data: {
                    id: encodeForwardId(msg.content.messageType, msg.content.senderUid, msg.content.resId),
                },
            },
        ];
    } else if (msg.type === 'lightApp') {
        return [
            {
                type: 'json',
                data: {
                    data: JSON.stringify(msg.content.payload),
                },
            },
        ];
    } else {
        // Currently impossible to reach here
        throw new Error('Unsupported message type');
    }
}
