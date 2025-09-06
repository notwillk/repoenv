import { EnvVars } from '@/types/EnvVars';

import { decrypt } from '@/util/crypto';
import { EncryptedVariable } from '@/schemas/versions/variable';

type Options = {
  def: EncryptedVariable;
  envVars: EnvVars;
};

export default function getEncryptedValue({ def, envVars }: Options): string {
  const encryptionKey = envVars[def.encryption_key_name];

  if (!encryptionKey) {
    throw new Error(`Encryption key ${def.encryption_key_name} not found in environment`);
  }

  return decrypt(def.encrypted, encryptionKey);
}
