import EnvVars from '@/util/EnvVars';

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
import Value from './Value';
import logger from './logger';

type Options = {
  def: Variable;
  cwd: string;
  envVars: EnvVars;
};

function getValue({ def, cwd, envVars }: Options): Value {
  if (isPlainStringVariable(def)) {
    logger.debug('Definition is plain string');
    return Value.fromString(def);
  } else if (isValueVariable(def)) {
    logger.debug('Definition is string');
    return new Value({ value: getValueVariable({ def, envVars }), redact: def.redact });
  } else if (isSubstitutionVariable(def)) {
    logger.debug('Value is substituted via command');
    return new Value({ value: getSubstitutedValue({ def, envVars, cwd }) });
  } else if (isEncryptedVariable(def)) {
    logger.debug('Value was encrypted');
    return new Value({ value: getEncryptedValue({ def, envVars }) });
  }

  throw new Error('Error parsing file');
}

export default function processVariable({ def, cwd, envVars }: Options): Value {
  const output = getValue({ def, cwd, envVars });
  logger.debug(`Value: ${output.toString()}`);
  return output;
}
