import path from 'node:path';

import { EnvVars } from '@/types/EnvVars';
import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';
import getDerivationOrder from '@/util/getDerivationOrder';

import processVariable from './processVariable';
import filterVariables from './filterVariables';
import logger from '../logger';

type Options = { filePath: string; incomingEnvVars?: EnvVars; decryptionKey: string };

export default function processSourceFile({
  filePath,
  decryptionKey,
  incomingEnvVars = {},
}: Options) {
  logger.debug(`Processing file ${filePath}`);
  const envVars: EnvVars = { ...incomingEnvVars };
  logger.debug(`Incoming env var keys ${Object.keys(envVars)}`);

  const source = readFile(filePath, SourceSchema);
  const derivationOrder = getDerivationOrder(source);
  const otherSourceVars = source.vars
    ? Object.keys(source.vars).filter((k) => !(k in envVars))
    : [];
  const otherIncomingVars = Object.keys(envVars).filter((k) => !derivationOrder.includes(k));
  const varsToProcess = [...otherIncomingVars, ...otherSourceVars, ...derivationOrder];

  logger.debug(`Var process order: ${varsToProcess}`);

  varsToProcess.forEach((varName) => {
    if (source.vars && varName in source.vars) {
      logger.debug(`Processing variable ${varName} from source file`);
      const value = processVariable({
        def: source.vars[varName],
        cwd: path.dirname(path.resolve(filePath)),
        decryptionKey,
        envVars,
      });
      envVars[varName] = value;
    } else if (varName in envVars) {
      logger.debug(`No change in variable ${varName}, using existing value`);
    } else {
      throw new Error(`Variable ${varName} not found in source file or environment`);
    }
  });

  return source.filter
    ? filterVariables({
        filters: source.filter,
        envVars,
      })
    : envVars;
}
