import { OneBotApp } from '@app/index';
import { z } from 'zod';

export interface OneBotGeneralResponse {
    status: 'ok' | 'async' | 'failed';
    retcode: number;
    data: unknown;
    msg?: string;
    wording?: string;
}

export function Ok(data?: unknown): OneBotGeneralResponse {
    return { status: 'ok', retcode: 0, data };
}

export function Failed(retcode: number, msg: string, wording: string = msg): OneBotGeneralResponse {
    return { status: 'failed', retcode, data: null, msg, wording };
}

export interface OneBotAction {
    endpoint: string;
    alias?: string[];
    validator: z.ZodType;
    handler: (ctx: OneBotApp, payload: unknown) => OneBotGeneralResponse | Promise<OneBotGeneralResponse>;
}

export function defineAction<T extends z.ZodType>(
    endpoint: string,
    validator: T,
    handler: (ctx: OneBotApp, payload: z.output<T>) => OneBotGeneralResponse | Promise<OneBotGeneralResponse>,
    alias?: string[]
): OneBotAction {
    return { endpoint, alias, validator, handler };
}

function encodeZodIssues(issues: z.ZodIssue[]): string {
    return issues.map((issue) => `[${issue.code}] ${issue.path.join('/')}: ${issue.message}`).join('; ');
}

export class ActionCollection {
    private actions: Map<string, OneBotAction> = new Map();

    constructor(private readonly ctx: OneBotApp, actions: OneBotAction[]) {
        actions.forEach((action) => {
            this.actions.set(action.endpoint, action);
            action.alias?.forEach((alias) => this.actions.set(alias, action));
        });
    }

    async handleAction(endpoint: string, payload: unknown): Promise<OneBotGeneralResponse> {
        const action = this.actions.get(endpoint);
        if (!action) {
            return Failed(404, 'Action not found');
        }
        try {
            const parsedPayload = action.validator.safeParse(payload);
            if (!parsedPayload.success) {
                return Failed(
                    400,
                    'Invalid payload',
                    encodeZodIssues(parsedPayload.error.issues)
                );
            }
            return await action.handler(this.ctx, parsedPayload.data);
        } catch (e) {
            this.ctx.logger.warn(`Error while handling action ${endpoint}: ${
                e instanceof Error ? e.message + '\n' + e.stack : String(e)
            }`);
            if (e instanceof z.ZodError) {
                return Failed(400, 'Invalid payload', encodeZodIssues(e.issues));
            }
            return Failed(500, 'Internal error', e instanceof Error ? e.message : String(e));
        }
    }
}
