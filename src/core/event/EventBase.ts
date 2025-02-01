/* eslint-disable @typescript-eslint/no-explicit-any */

import EventEmitter from 'node:events';
import { BotContext } from '@/core';

export type Event<Name extends string, Out> = {
    name: Name;
    command: string;
    parse: (ctx: BotContext, payload: Buffer) => Out | PromiseLike<Out>;
}

export function defineEvent<Name extends string, Out>(
    name: Name,
    command: string,
    parse: Event<Name, Out>['parse'],
): Event<Name, Out> {
    return { name, command, parse };
}

export type EventArray = Readonly<Array<Event<string, any>>>;
type ExtractEventOutByName<
    T extends EventArray,
    K extends string
> = {
    [E in T[number] as E['name']] : Awaited<ReturnType<E['parse']>>
}[K];

export class EventChannel<T extends EventArray> {
    private internalEmitter = new EventEmitter();
    private events;

    constructor(
        public ctx: BotContext,
        events: T
    ) {
        this.events = Object.fromEntries(events.map(event => [event.command, event]));
    }

    on<K extends T[number]['name']>(
        event: K,
        listener: (out: Awaited<ExtractEventOutByName<T, K>>) => void
    ): void {
        this.internalEmitter.on(event, listener);
    }

    off<K extends T[number]['name']>(
        event: K,
        listener: (out: Awaited<ExtractEventOutByName<T, K>>) => void
    ): void {
        this.internalEmitter.off(event, listener);
    }

    once<K extends T[number]['name']>(
        event: K,
        listener: (out: Awaited<ExtractEventOutByName<T, K>>) => void
    ): void {
        this.internalEmitter.once(event, listener);
    }

    async parse(command: string, payload: Buffer) {
        const event = this.events[command];
        if (event) {
            const parsed = await event.parse(this.ctx, payload);
            this.internalEmitter.emit(event.name, parsed);
        }
    }
}