import { EnvVars } from '@/util/EnvVars';

import getSubstitutedValue from '@/util/getSubstitutedValue';
import {
  isEncryptedVariable,
  isPlainStringVariable,
  isSubstitutionVariable,
  isValueVariable,
  Variable,
} from '@/schemas/versions/variable';
import getEncryptedValue from './getEncryptedValue';
import getValueVariable from './getValueVariable';

type Options = {
  def: Variable;
  cwd: string;
  envVars: EnvVars;
};

export default function processVariable({ def, cwd, envVars }: Options): string {
  if (isPlainStringVariable(def)) {
    return def;
  } else if (isValueVariable(def)) {
    return getValueVariable({ def, envVars });
  } else if (isSubstitutionVariable(def)) {
    return getSubstitutedValue({ def, envVars, cwd });
  } else if (isEncryptedVariable(def)) {
    return getEncryptedValue({ def, envVars });
  }

  throw new Error('Error parsing file');
}
