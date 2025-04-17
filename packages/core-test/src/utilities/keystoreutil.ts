import fs from 'node:fs/promises';
import { deserializeKeystore, type Keystore, newKeystore, serializeKeystore } from 'tanebi';
import fsutil from './fsutil';

const path = 'keystore.json';

export default {
    initialize: async () => {
        if (await fsutil.exists(path)) {
            return deserializeKeystore(JSON.parse(await fs.readFile(path, { encoding: 'utf8' })));
        } else {
            return newKeystore();
        }
    },
    save: async (keystore: Keystore) => {
        fs.writeFile(path, JSON.stringify(serializeKeystore(keystore), null, 4));
    },
};
