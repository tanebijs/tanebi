import { Failed, OneBotGeneralResponse } from '@/entity/response';
import { OneBotApp } from '@/index';
import { z } from 'zod';

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
                    parsedPayload.error.issues.map((issue) => issue.message).join('; ')
                );
            }
            return await action.handler(this.ctx, parsedPayload);
        } catch (e) {
            return Failed(500, 'Internal error', e instanceof Error ? e.message : String(e));
        }
    }
}
