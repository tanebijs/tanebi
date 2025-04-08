import { OneBotApp } from '@app/index';
import { SendResourceGeneralData } from '@app/message/segment';
import fsp from 'node:fs/promises';

async function getResponse(
    url: string,
    timeout?: number,
    headers: Record<string, string> = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
    },
    useReferer: boolean = false
): Promise<Response> {
    if (useReferer && !headers['Referer']) {
        headers['Referer'] = url;
    }
    if (timeout) {
        const abc = new AbortController();
        const timer = setTimeout(() => {
            abc.abort();
        }, timeout);
        const resp = await fetch(url, {
            headers,
            signal: abc.signal,
        });
        clearTimeout(timer);
        return resp;
    } else {
        return await fetch(url, { headers });
    }
}

export async function download(url: string, timeout?: number, headers?: Record<string, string>) {
    let resp = await getResponse(url, timeout, headers);
    if (resp.status === 403 && !headers) {
        resp = await getResponse(url, timeout, headers, true);
    }
    if (!resp.ok) {
        throw new Error(`Failed to download file from ${url}: ${resp.status} ${resp.statusText}`);
    }
    return await resp.blob().then((b) => b.bytes());
}

export async function resolveOneBotFile(ctx: OneBotApp, file: SendResourceGeneralData) {
    const url = file.file;
    if (url.startsWith('file://')) {
        return await fsp.readFile(url.slice(7));
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const bytes = await download(url, file.timeout);
            return Buffer.from(bytes); // TODO: add proxy support
        } catch (e) {
            if (e instanceof Error && e.message === 'This operation was aborted') {
                throw new Error(`Download timeout (exceeded ${file.timeout}ms)`);
            } else {
                throw e;
            }
        }
    }
    if (url.startsWith('base64://')) {
        return Buffer.from(url.slice(9), 'base64');
    }
    throw new Error(`Unsupported URL scheme: ${url}`);
}
