import path from 'node:path';
import { env } from 'string-env-interpolation';

import { EnvVars } from '../types/EnvVars';
import VariablesSchema from '../schemas/variables';
import readFile from './readFile';
import getDerivationOrder from './getDerivationOrder';
import {
  isPlainStringVariableDefinition,
  isValueVariableDefinition,
  isDerivedVariableDefinition,
  isSubstitutionVariableDefinition,
  isEncryptedVariableDefinition,
} from '../types/Variables';
import getSubstitutedValue from './getSubstitutedValue';
import { decrypt } from './crypto';

type Options = { filePath: string; incomingEnvVars?: EnvVars; decryptionKey: string };

export default function processVariableFile({
  filePath,
  decryptionKey,
  incomingEnvVars = {},
}: Options) {
  const envVars: EnvVars = { ...incomingEnvVars };

  const variables = readFile(filePath, VariablesSchema);
  const derivationOrder = getDerivationOrder(variables);

  derivationOrder.forEach((varName) => {
    const variableDefinition = variables.vars[varName];

    if (isPlainStringVariableDefinition(variableDefinition)) {
      envVars[varName] = variableDefinition;
    } else if (isValueVariableDefinition(variableDefinition)) {
      const { value } = variableDefinition;
      envVars[varName] = value;
    } else if (isDerivedVariableDefinition(variableDefinition)) {
      envVars[varName] = env(variableDefinition.derived_value, envVars);
    } else if (isSubstitutionVariableDefinition(variableDefinition)) {
      envVars[varName] = getSubstitutedValue({
        command: env(variableDefinition.substitution, envVars),
        cwd: path.dirname(path.resolve(filePath)),
      });
    } else if (isEncryptedVariableDefinition(variableDefinition)) {
      envVars[varName] = decrypt(variableDefinition.encrypted, decryptionKey);
    } else {
      throw new Error('Error parsing file');
    }
  });

  return envVars;
}
