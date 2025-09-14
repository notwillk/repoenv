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
import externalValidate from './externalValidate';
import FailedExternalValidationError from '@/errors/FailedExternalValidationError';
import FailedRegexpValidationError from '@/errors/FailedRegexpValidationError';
import { parseFormat } from './formats';
import { SUPORTED_FORMATS } from './ParsedFormat';
import FailedFormatValidationError from '@/errors/FailedFormatValidationError';

type Options = {
  def: Variable;
  cwd: string;
  envVars: EnvVars;
};

function getRegexp(def: Variable): RegExp | undefined {
  const maybeRegexp = isPlainStringVariable(def) ? undefined : def.regexp;
  return maybeRegexp ? new RegExp(maybeRegexp) : undefined;
}

function getValue({ def, cwd, envVars }: Options): Value {
  if (isPlainStringVariable(def)) {
    logger.debug('Definition is plain string');
    return Value.fromString(def);
  } else if (isValueVariable(def)) {
    logger.debug('Definition is string');
    const value = getValueVariable({ def, envVars });
    return new Value({ value, redact: def.redact });
  } else if (isSubstitutionVariable(def)) {
    logger.debug('Value is substituted via command');
    const value = getSubstitutedValue({ def, envVars, cwd });
    return new Value({ value });
  } else if (isEncryptedVariable(def)) {
    logger.debug('Value was encrypted');
    const value = getEncryptedValue({ def, envVars });
    return new Value({ value });
  }

  throw new Error('Error parsing file');
}

export default async function processVariable({ def, cwd, envVars }: Options): Promise<Value> {
  const output = getValue({ def, cwd, envVars });
  logger.debug(`Value: ${output.toString()}`);
  const maybeRegexp = getRegexp(def);

  const maybeValue = output.getValue();

  if (maybeRegexp && maybeValue !== undefined) {
    logger.debug(`Validating value against regexp: ${maybeRegexp}`);
    if (!maybeRegexp.test(maybeValue)) {
      throw new FailedRegexpValidationError({ regexp: maybeRegexp });
    }
  }

  const maybeFormat = isPlainStringVariable(def) ? undefined : def.format;
  if (maybeFormat && maybeValue !== undefined) {
    logger.debug(`Validating value via format: ${maybeFormat}`);

    const maybeParsedFormat = parseFormat(maybeFormat, SUPORTED_FORMATS);
    const good = Boolean(maybeParsedFormat?.validate(maybeValue));

    if (!good) {
      throw new FailedFormatValidationError({ format: maybeFormat });
    }
  }

  const maybeValidator = isPlainStringVariable(def) ? undefined : def.validator;
  if (maybeValidator) {
    logger.debug(`Validating value via external command: ${maybeValidator}`);
    const good = await externalValidate({ value: maybeValue, command: maybeValidator });
    if (!good) {
      throw new FailedExternalValidationError();
    }
  }

  return output;
}
