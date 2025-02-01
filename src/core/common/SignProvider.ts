export interface SignProvider {
    sign(cmd: string, src: Buffer, seq: number): PromiseLike<SignResult | undefined>;
}

export interface SignResult {
    sign: Buffer;
    token: Buffer;
    extra: Buffer;
}

export function UrlSignProvider(signApiUrl: string): SignProvider {
    return {
        async sign(cmd, src, seq) {
            const res = await fetch(signApiUrl, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cmd,
                    src: src.toString('hex'),
                    seq,
                }),
            });
            const json = await res.json();
            const signBody = json.value;
            return ({
                sign: Buffer.from(signBody.sign, 'hex'),
                token: Buffer.from(signBody.token, 'hex'),
                extra: Buffer.from(signBody.extra, 'hex'),
            });
        }
    };
}