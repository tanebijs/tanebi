import type { ChalkInstance } from 'chalk';
import chalk from 'chalk';
import winston, { type Logger } from 'winston';

export type Level = 'trace' | 'info' | 'warning' | 'fatal';

const levels: { [Label in Level]: number; } = {
    trace: 0,
    info: 1,
    warning: 2,
    fatal: 3,
};
const colors: { [Label in Level]: ChalkInstance; } = {
    trace: chalk.white,
    info: chalk.green,
    warning: chalk.yellow,
    fatal: chalk.red,
};

const cache: { [tag: string]: Logger; } = {};

const printf = (info: { level: string; message: unknown; [key: string | symbol]: unknown; }) => {
    return colors[info.level as Level](`[${info.timestamp}] [${info.level}] [${info.label}] ${info.message}`);
};
const timestamp = () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // 拼接格式化后的字符串
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};
const transports = [new winston.transports.Console()];
const log = (tag: string, level: Level, message: string) => {
    (cache[tag] ??= winston.createLogger({
        levels,
        format: winston.format.combine(
            winston.format.label({ label: tag }),
            winston.format.timestamp({ format: timestamp }),
            winston.format.printf(printf),
        ),
        transports,
    })).log(level, message);
};

const tag = (tag: string): { [Label in Level]: (message: string) => void; } => {
    return ({
        trace: (message) => log(tag, 'trace', message),
        info: (message) => log(tag, 'info', message),
        warning: (message) => log(tag, 'warning', message),
        fatal: (message) => log(tag, 'fatal', message),
    });
};

export default {
    tag,
    ...tag('core::test'),
};
