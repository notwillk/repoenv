import z from 'zod';

import {
  Aes256GcmKeySchema,
  Ed25519KeySchema,
  X25519KeySchema,
} from '@/schemas/versions/config/v0';

const DEFAULT_COMMAND = 'cat # update this';

export const DEFAULT_AES_256_GCM_KEY_DEFINITION: z.infer<typeof Aes256GcmKeySchema> = {
  scheme: 'aes-256-gcm',
  update: { cmd: DEFAULT_COMMAND },
};

export const DEFAULT_X25519_KEY_DEFINITION: z.infer<typeof X25519KeySchema> = {
  scheme: 'x25519',
  update: { encrypt: { cmd: DEFAULT_COMMAND }, decrypt: { cmd: DEFAULT_COMMAND } },
};

export const DEFAULT_ED25519_KEY_DEFINITION: z.infer<typeof Ed25519KeySchema> = {
  scheme: 'ed25519',
  update: { sign: { cmd: DEFAULT_COMMAND }, verify: { cmd: DEFAULT_COMMAND } },
};

const DEFAULT_SECRET_KEYS = [
  DEFAULT_AES_256_GCM_KEY_DEFINITION,
  DEFAULT_X25519_KEY_DEFINITION,
  DEFAULT_ED25519_KEY_DEFINITION,
] as const;

export default DEFAULT_SECRET_KEYS;
