import EnvVars from '@/util/EnvVars';

import { aes256GcmDecrypt } from '@/util/crypto';
import { EncryptedVariable, SUPPORTED_ENCRYPTION_ALGORITHMS } from '@/schemas/versions/variable';

type Options = {
  def: EncryptedVariable;
  envVars: EnvVars;
};

const DECRYPTION_FUNCTIONS: Record<
  (typeof SUPPORTED_ENCRYPTION_ALGORITHMS)[number],
  typeof aes256GcmDecrypt
> = {
  'aes-256-gcm': aes256GcmDecrypt,
};

export default function getEncryptedValue({ def, envVars }: Options): string {
  const encryptionKey = envVars.get(def.encryption_key_name);

  if (!encryptionKey) {
    throw new Error(`Encryption key ${def.encryption_key_name} not found in environment`);
  }

  const decrypt = DECRYPTION_FUNCTIONS[def.encryption_algorithm];
  return decrypt({
    ciphertext: def.encrypted,
    key: encryptionKey,
    encoding: def.encryption_encoding,
  });
}
