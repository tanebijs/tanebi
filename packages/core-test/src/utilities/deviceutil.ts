import fs from 'node:fs/promises';
import { deserializeDeviceInfo, newDeviceInfo, serializeDeviceInfo } from 'tanebi';
import fsutil from './fsutil';

const path = 'device.json';

export default {
    initialize: async () => {
        if (await fsutil.exists(path)) {
            return deserializeDeviceInfo(JSON.parse(await fs.readFile(path, { encoding: 'utf8' })));
        } else {
            const device = newDeviceInfo();
            await fs.writeFile(path, JSON.stringify(serializeDeviceInfo(device), null, 4));
            return device;
        }
    },
};
