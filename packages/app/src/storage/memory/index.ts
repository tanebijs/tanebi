import { MemoryStorageConfig } from '@app/common/config';
import { OneBotApp } from '@app/index';
import { AbstractStorage, MessageRowOrEmpty } from '@app/storage';
import { MessageRow } from '@app/storage/types';
import { LRUCache } from 'lru-cache';
import { MessageType } from 'tanebi';

function encodePeerAndSequence(type: number, peerUin: number, sequence: number): bigint {
    return BigInt(type) << 63n | BigInt(peerUin) << 31n | BigInt(sequence);
}

function encodeClientSequence(friendUin: number, clientSequence: number): bigint {
    return BigInt(friendUin) << 32n | BigInt(clientSequence);
}

export class MemoryStorage extends AbstractStorage<MemoryStorageConfig> {
    autoIncrementId = 1;
    readonly primaryIndex;
    readonly peer_SequenceIndex;
    readonly private_ClientSequenceIndex;

    constructor(app: OneBotApp, config: MemoryStorageConfig) {
        super(app, config);
        const lruCacheConfig = {
            max: config.maxCount,
            ttl: config.maxLifetime * 1000,
        };
        this.primaryIndex = new LRUCache<number, MessageRow>(lruCacheConfig);
        this.peer_SequenceIndex = new LRUCache<bigint, MessageRow>(lruCacheConfig);
        this.private_ClientSequenceIndex = new LRUCache<bigint, MessageRow>(lruCacheConfig);
    }

    override async init() {}

    override insert(row: Omit<MessageRow, 'id'>): number {
        const id = this.autoIncrementId++;
        const messageRow: MessageRow = { ...row, id };
        this.primaryIndex.set(id, messageRow);
        this.peer_SequenceIndex.set(encodePeerAndSequence(row.type, row.peerUin, row.sequence), messageRow);
        if (row.type === MessageType.PrivateMessage) {
            this.private_ClientSequenceIndex.set(encodeClientSequence(row.peerUin, row.clientSequence!), messageRow);
        }
        return id;
    }

    override getById(id: number): MessageRowOrEmpty {
        return this.primaryIndex.get(id);
    }

    override getByPeerAndSequence(type: MessageType, peerUin: number, sequence: number): MessageRowOrEmpty {
        return this.peer_SequenceIndex.get(encodePeerAndSequence(type, peerUin, sequence));
    }

    override getPrivateByClientSequence(friendUin: number, clientSequence: number): MessageRowOrEmpty {
        return this.private_ClientSequenceIndex.get(encodeClientSequence(friendUin, clientSequence));
    }

    override size(): number {
        return this.primaryIndex.size;
    }
}
