import { OneBotRecvSegment } from '@app/message/segment';

const pattern = /\[CQ:(\w+)((,\w+=[^,\]]*)*)]/;

function unescape(source: string) {
    return String(source)
        .replace(/&#91;/g, '[')
        .replace(/&#93;/g, ']')
        .replace(/&#44;/g, ',')
        .replace(/&amp;/g, '&');
}

function from(source: string) {
    const capture = pattern.exec(source);
    if (!capture) return null;
    const [, type, attrs] = capture;
    const data: Record<string, unknown> = {};
    if (attrs) {
        attrs.slice(1).split(',').forEach((str) => {
            const index = str.indexOf('=');
            data[str.slice(0, index)] = unescape(str.slice(index + 1));
        });
    }
    return { type, data, capture };
}

function convert(type: string, data: unknown) {
    return { type, data };
}

export function decodeCQCode(source: string) {
    const elements: Array<unknown> = [];
    let result: ReturnType<typeof from>;
    while ((result = from(source))) {
        const { type, data, capture } = result;
        if (type) {
            if (capture.index) {
                elements.push({
                    type: 'text',
                    data: { text: unescape(source.slice(0, capture.index)) },
                });
            }
            elements.push(convert(type, data));
            source = source.slice(capture.index + capture[0].length);
        }
    }
    if (source) {
        elements.push({
            type: 'text',
            data: { text: unescape(source) },
        });
    }
    return elements;
}

function CQCodeEscapeText(text: string) {
    return text.replace(/&/g, '&amp;')
        .replace(/\[/g, '&#91;')
        .replace(/]/g, '&#93;');
}

function CQCodeEscape(text: string) {
    return text.replace(/&/g, '&amp;')
        .replace(/\[/g, '&#91;')
        .replace(/]/g, '&#93;')
        .replace(/,/g, '&#44;');
}

export function encodeCQCode(data: OneBotRecvSegment) {
    if (data.type === 'text') {
        return CQCodeEscapeText(data.data.text);
    }

    let result = '[CQ:' + data.type;
    for (const name in data.data) {
        const value = (data.data as Record<string, unknown>)[name];
        if (value === undefined || value === null) {
            continue;
        }
        result += `,${name}=${CQCodeEscape(String(value))}`;
    }
    result += ']';
    return result;
}
