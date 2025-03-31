import { download } from '@app/common/download';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import cp from 'node:child_process';

export class NTSilkBinding {
    private constructor(readonly ntSilkPath: string, readonly ntSilkFilePath: string) {}

    async execute(inPath: string, outPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cp.execFile(
                this.ntSilkFilePath,
                ['-i', inPath, outPath],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    static async create(ntSilkPath: string) {
        let ntSilkFileName: string | null = null;

        if (os.platform() === 'win32' && os.arch() === 'x64') {
            ntSilkFileName = 'ntsilk-win32-x64.exe';
        } else if (os.platform() === 'linux' && os.arch() === 'x64') {
            ntSilkFileName = 'ntsilk-linux-x64';
        }
        if (!ntSilkFileName) {
            throw new Error('NTSilk has not been compiled for this platform');
        }

        const ntSilkFilePath = path.join(ntSilkPath, ntSilkFileName);
        if (!fs.existsSync(ntSilkFilePath)) {
            console.info('First time of using NTSilk, downloading the binary...');
            const binary = await download(`https://ntsilk.ilharper.com/${ntSilkFileName}`);
            await fsp.writeFile(ntSilkFilePath, binary);
        }

        const silk = new NTSilkBinding(ntSilkPath, ntSilkFilePath);
        return silk;
    }
}