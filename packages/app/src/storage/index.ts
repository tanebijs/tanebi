import { OneBotApp } from '@/index';
import { MessageRow } from '@/storage/types';
import { MessageType } from 'tanebi';

export type MessageRowOrEmpty = MessageRow | undefined;
type PromiseOr<T> = T | Promise<T>;

export abstract class AbstractStorage<T> {
    constructor(readonly app: OneBotApp, readonly config: T) {}

    abstract init(): Promise<void>;
    abstract insert(row: Omit<MessageRow, 'id'>): number | Promise<number>;
    abstract getById(id: number): PromiseOr<MessageRowOrEmpty>;
    abstract getByPeerAndSequence(type: MessageType, peerUin: number, sequence: number): PromiseOr<MessageRowOrEmpty>;
    abstract getPrivateByClientSequence(friendUin: number, clientSequence: number): PromiseOr<MessageRowOrEmpty>;
}
