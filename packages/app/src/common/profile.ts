import { z } from 'zod';

export const zProfile = z.object({
    name: z.string(),
});
export type Profile = z.infer<typeof zProfile>;

export const defaultProfile: Profile = {
    name: 'default',
};