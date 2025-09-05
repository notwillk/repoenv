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
  decryptionKey: string;
  envVars: EnvVars;
};

export default function processVariable({ def, cwd, decryptionKey, envVars }: Options): string {
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
    return decrypt(def.encrypted, decryptionKey);
  }

  throw new Error('Error parsing file');
}
