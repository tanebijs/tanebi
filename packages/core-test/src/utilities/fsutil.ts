import fs from 'node:fs/promises';

export default {
    exists: async (path: string) => {
        try {
            await fs.access(path, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    },
};
