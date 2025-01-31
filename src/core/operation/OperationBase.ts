/* eslint-disable @typescript-eslint/no-explicit-any */

import { BotContext } from '@/core';
import { Mutex } from 'async-mutex';

export type Operation<
    Name extends string,
    Args extends Array<unknown>,
    Ret = undefined,
> = {
    name: Name;
    command: string;
    build: (ctx: BotContext, ...args: Args) => Buffer | PromiseLike<Buffer>;
    parse: (ctx: BotContext, payload: Buffer) => Ret | PromiseLike<Ret>;
};

type OperationArray = Readonly<Array<Operation<string, any, any>>>;
type OperationMap<T extends OperationArray> = { [Op in T[number] as Op['name']]: Op };
type ExtractRestArgs<T> = T extends [BotContext, ...infer B] ? B : never;

export function defineOperation<
    Name extends string,
    Args extends unknown[] = [],
    Ret = undefined,
>(
    name: Name,
    command: string,
    build: Operation<Name, Args, Ret>['build'],
    parse: Operation<Name, Args, Ret>['parse'],
): Operation<Name, Args, Ret> {
    return { name, command, build, parse };
}

export class OperationCollection<const T extends OperationArray> {
    private readonly operationMap: OperationMap<T>;
    private atomicSeq = 4000;
    private mutex = new Mutex();

    constructor(
        public ctx: BotContext,
        public operations: T
    ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.operationMap = Object.fromEntries(
            this.operations.map(action => [action.name, action]));
    }

    async call<const OpName extends keyof OperationMap<T>>(
        name: OpName,
        ...args: ExtractRestArgs<Parameters<
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            OperationMap<T>[OpName]['build']>>
    ): Promise<Awaited<ReturnType<
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        OperationMap<T>[OpName]['parse']>>> {
        const action = this.operationMap[name] as Operation<string, unknown[]>;
        const buf = await action.build(this.ctx, ...args);
        const retPacket = await this.ctx.networkLogic.sendSsoPacket(
            action.command, buf, await this.nextSeq());

        if ('body' in retPacket) {
            return action.parse(this.ctx, retPacket.body) as any;
        } else {
            throw new Error(`Action call failed (retcode ${retPacket.retcode}): ${retPacket.extra}`);
        }
    }

    private async nextSeq() {
        return this.mutex.runExclusive(() => this.atomicSeq++);
    }
}