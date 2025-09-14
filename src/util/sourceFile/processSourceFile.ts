import path from 'node:path';

import EnvVars from '@/util/EnvVars';
import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';
import getDerivationOrder from '@/util/getDerivationOrder';
import Value from '@/util/Value';

import processVariable from '../processVariable';
import logger from '../logger';
import { Variables } from '@/schemas/versions/source/v0';

type Options = { filePath: string; incomingEnvVars?: EnvVars };

function mergeVariables({
  incomingEnvVars,
  variables,
  cwd,
}: {
  incomingEnvVars: EnvVars;
  variables: Variables;
  cwd: string;
}): EnvVars {
  const envVars: EnvVars = new EnvVars(incomingEnvVars);
  logger.debug(`Incoming env var keys ${Object.keys(envVars)}`);

  const derivationOrder = getDerivationOrder(variables);
  const otherSourceVars = variables ? Object.keys(variables).filter((k) => !envVars.has(k)) : [];
  const otherIncomingVars = envVars.keys().filter((k) => !derivationOrder.includes(k));
  const varsToProcess = [...otherIncomingVars, ...otherSourceVars, ...derivationOrder];

  logger.debug(`Var process order: ${varsToProcess}`);

  varsToProcess.forEach((varName) => {
    if (variables && varName in variables) {
      logger.debug(`Processing variable ${varName} from source file`);
      const def = variables[varName];
      const value = processVariable({ def, cwd, envVars });
      envVars.set(varName, new Value({ value }));
    } else if (envVars.has(varName)) {
      logger.debug(`No change in variable ${varName}, using existing value`);
    } else {
      throw new Error(`Variable ${varName} not found in source file or environment`);
    }
  });

  return envVars;
}

export default function processSourceFile({ filePath, incomingEnvVars }: Options) {
  logger.debug(`Processing file ${filePath}`);

  const source = readFile(filePath, SourceSchema);
  const envVars = mergeVariables({
    incomingEnvVars: incomingEnvVars ? incomingEnvVars : new EnvVars(),
    variables: source.vars,
    cwd: path.dirname(path.resolve(filePath)),
  });

  return source.filter ? envVars.filter(source.filter) : envVars;
}
