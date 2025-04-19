/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { BotContext } from '@/internal';
import { Mutex } from 'async-mutex';

export type Operation<
    Name extends string,
    Args extends Array<unknown>,
    Ret = undefined,
> = {
    name: Name;
    command: string;
    build: (ctx: BotContext, ...args: Args) => Buffer;
    parse: (ctx: BotContext, payload: Buffer) => Ret;
    postOnly: boolean;
};

type OperationArray = Readonly<Array<Operation<string, any, any>>>;
type OperationMap<T extends OperationArray> = { [Op in T[number] as Op['name']]: Op; };
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
): Operation<Name, Args, Ret>;
export function defineOperation<
    Name extends string,
    Args extends unknown[] = [],
>(
    name: Name,
    command: string,
    build: Operation<Name, Args>['build'],
    parse?: Operation<Name, Args>['parse'],
): Operation<Name, Args>;
export function defineOperation<
    Name extends string,
    Args extends unknown[] = [],
    Ret = undefined,
>(
    name: Name,
    command: string,
    build: Operation<Name, Args, Ret>['build'],
    parse?: Operation<Name, Args, Ret>['parse'],
): Operation<Name, Args, Ret> {
    if (parse) {
        return {
            name,
            command,
            build,
            parse,
            postOnly: false,
        };
    } else {
        return {
            name,
            command,
            build,
            parse: () => undefined as Ret,
            postOnly: true,
        };
    }
}

export class OperationCollection<const T extends OperationArray> {
    private readonly operationMap: OperationMap<T>;
    private atomicSeq = 4000;
    private mutex = new Mutex();

    constructor(
        public ctx: BotContext,
        operations: T,
    ) {
        // @ts-ignore
        this.operationMap = Object.fromEntries(operations.map(action => [action.name, action]));
    }

    async call<const OpName extends keyof OperationMap<T>>(
        name: OpName,
        ...args: ExtractRestArgs<
            Parameters<
                // @ts-ignore
                OperationMap<T>[OpName]['build']
            >
        >
    ): Promise<
        ReturnType<
            // @ts-ignore
            OperationMap<T>[OpName]['parse']
        >
    > {
        const action = this.operationMap[name] as Operation<string, unknown[]>;
        const buf = action.build(this.ctx, ...args);
        if (action.postOnly) {
            await this.ctx.ssoLogic.postSsoPacket(action.command, buf, await this.nextSeq());
            return undefined as ReturnType<
                // @ts-ignore
                OperationMap<T>[OpName]['parse']
            >;
        } else {
            const seq = await this.nextSeq();
            const retPacket = await this.ctx.ssoLogic
                .sendSsoPacket(action.command, buf, seq);

            if ('body' in retPacket) {
                return action.parse(this.ctx, retPacket.body) as any;
            } else {
                throw new Error(
                    `Action call failed (cmd=${action.command} seq=${seq} retcode=${retPacket.retcode}): ${retPacket.extra}`,
                );
            }
        }
    }

    private async nextSeq() {
        return this.mutex.runExclusive(() => this.atomicSeq++);
    }
}
