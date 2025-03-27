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
