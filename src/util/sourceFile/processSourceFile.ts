import path from 'node:path';

import { EnvVars } from '@/types/EnvVars';
import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';
import getDerivationOrder from '@/util/getDerivationOrder';

import processVariable from './processVariable';
import filterVariables from './filterVariables';

type Options = { filePath: string; incomingEnvVars?: EnvVars; decryptionKey: string };

export default function processSourceFile({
  filePath,
  decryptionKey,
  incomingEnvVars = {},
}: Options) {
  const envVars: EnvVars = { ...incomingEnvVars };

  const source = readFile(filePath, SourceSchema);
  const derivationOrder = getDerivationOrder(source);

  derivationOrder.forEach((varName) => {
    const value = processVariable({
      def: source.vars[varName],
      cwd: path.dirname(path.resolve(filePath)),
      decryptionKey,
      envVars,
    });

    envVars[varName] = value;
  });

  return source.filter
    ? filterVariables({
        filters: source.filter,
        envVars,
      })
    : envVars;
}
