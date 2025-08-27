import { env } from 'string-env-interpolation';

import { EnvVars } from '@/types/EnvVars';
import {
  isPlainStringVariableDefinition,
  isValueVariableDefinition,
  isDerivedVariableDefinition,
  isSubstitutionVariableDefinition,
  isEncryptedVariableDefinition,
  VariableDefinition,
} from '@/types/Variables';
import getSubstitutedValue from '@/util/getSubstitutedValue';
import { decrypt } from '@/util/crypto';

type Options = {
  def: VariableDefinition;
  cwd: string;
  decryptionKey: string;
  envVars: EnvVars;
};

export default function processVariable({ def, cwd, decryptionKey, envVars }: Options): string {
  if (isPlainStringVariableDefinition(def)) {
    return def;
  } else if (isValueVariableDefinition(def)) {
    const { value } = def;
    return value;
  } else if (isDerivedVariableDefinition(def)) {
    return env(def.derived_value, envVars);
  } else if (isSubstitutionVariableDefinition(def)) {
    return getSubstitutedValue({
      command: env(def.substitution, envVars),
      cwd,
    });
  } else if (isEncryptedVariableDefinition(def)) {
    return decrypt(def.encrypted, decryptionKey);
  }

  throw new Error('Error parsing file');
}
