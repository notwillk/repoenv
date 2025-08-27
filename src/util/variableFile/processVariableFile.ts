import path from 'node:path';

import { EnvVars } from '@/types/EnvVars';
import VariablesSchema from '@/schemas/variables';
import readFile from '@/util/readFile';
import getDerivationOrder from '@/util/getDerivationOrder';

import processVariable from './processVariable';
import filterVariables from './filterVariables';

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
    const value = processVariable({
      def: variables.vars[varName],
      cwd: path.dirname(path.resolve(filePath)),
      decryptionKey,
      envVars,
    });

    envVars[varName] = value;
  });

  return variables.filter
    ? filterVariables({
        filters: variables.filter,
        envVars,
      })
    : envVars;
}
