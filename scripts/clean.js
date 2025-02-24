import fs from 'node:fs';

if (fs.existsSync('lib')) {
    fs.rmSync('lib', { recursive: true });
}