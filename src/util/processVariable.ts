import { env } from 'string-env-interpolation';

import { EnvVars } from '@/types/EnvVars';

import getSubstitutedValue from '@/util/getSubstitutedValue';
import { decrypt } from '@/util/crypto';
import {
  isEncryptedVariable,
  isPlainStringVariable,
  isSubstitutionVariable,
  isValueVariable,
  Variable,
} from '@/schemas/versions/variable';

type Options = {
  def: Variable;
  cwd: string;
  envVars: EnvVars;
};

export default function processVariable({ def, cwd, envVars }: Options): string {
  if (isPlainStringVariable(def)) {
    return def;
  } else if (isValueVariable(def)) {
    return env(def.value, envVars);
  } else if (isSubstitutionVariable(def)) {
    return getSubstitutedValue({
      command: env(def.substitution, envVars),
      cwd,
    });
  } else if (isEncryptedVariable(def)) {
    const encryptionKey = envVars[def.encryption_key_name];

    if (!encryptionKey) {
      throw new Error(`Encryption key ${def.encryption_key_name} not found in environment`);
    }

    return decrypt(def.encrypted, encryptionKey);
  }

  throw new Error('Error parsing file');
}
