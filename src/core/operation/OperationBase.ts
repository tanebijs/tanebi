import { BotContext } from '@/core';
import { Mutex } from 'async-mutex';

export type CallResult<T> = {
    result: T;
} | {
    retcode: Exclude<number, 0>;
    extra: string;
}

export type Operation<
    Name extends string,
    Args = undefined,
    Ret = undefined,
> = {
    name: Name;
    command: string;
    build: (ctx: BotContext, args: Args) => Buffer | PromiseLike<Buffer>;
    parse: (ctx: BotContext, payload: Buffer) => Ret | PromiseLike<Ret>;
}

export function defineOperation<
    Name extends string,
    Args = undefined,
    Ret = undefined,
>(
    name: Name,
    command: string,
    build: Operation<Name, Args, Ret>['build'],
    parse: Operation<Name, Args, Ret>['parse'],
): Operation<Name, Args, Ret> {
    return { name, command, build, parse };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class OperationCollection<const T extends Readonly<Array<Operation<string, any, any>>>> {
    private operationMap;
    private atomicSeq = 4000;
    private mutex = new Mutex();

    constructor(
        public ctx: BotContext,
        public operations: T
    ) {
        this.operationMap = Object.fromEntries(
            this.operations.map(action => [action.name, action]));
    }


    async call<Op extends T[number]>(
        name: Op['name'],
        args: Parameters<Op['build']>[1],
    ): Promise<CallResult<Awaited<ReturnType<Op['parse']>>>>;
    async call<Op extends T[number] & Operation<string, undefined, unknown>>(
        name: Op['name'],
        args?: Parameters<Op['build']>[1],
    ): Promise<CallResult<Awaited<ReturnType<Op['parse']>>>>;
    async call<Op extends T[number]>(
        name: Op['name'],
        args: Parameters<Op['build']>[1],
    ): Promise<CallResult<Awaited<ReturnType<Op['parse']>>>> {
        const action = this.operationMap[name] as Op;
        const buf = await action.build(this.ctx, args);
        const retPacket = await this.ctx.networkLogic.sendSsoPacket(
            action.command, buf, await this.nextSeq());

        if ('body' in retPacket) {
            return {
                result: action.parse(this.ctx, retPacket.body) as Awaited<ReturnType<Op['parse']>>,
            };
        } else {
            return {
                retcode: retPacket.retcode,
                extra: retPacket.extra,
            };
        }
    }

    private async nextSeq() {
        return this.mutex.runExclusive(() => this.atomicSeq++);
    }
}