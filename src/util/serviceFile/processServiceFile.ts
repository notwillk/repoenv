import path from 'node:path';

import EnvVars from '@/util/EnvVars';
import ServiceSchema from '@/schemas/service';
import readFile from '@/util/readFile';

import logger from '../logger';
import mergeVariables from '../mergeVariables';

type Options = { filePath: string; incomingEnvVars?: EnvVars };

export default async function processServiceFile({ filePath, incomingEnvVars }: Options) {
  logger.debug(`Processing file ${filePath}`);

  const service = readFile(filePath, ServiceSchema);
  const envVars = await mergeVariables({
    incomingEnvVars: incomingEnvVars ? incomingEnvVars : new EnvVars(),
    variables: service.vars,
    cwd: path.dirname(path.resolve(filePath)),
  });

  return service.filter ? envVars.filter(service.filter) : envVars;
}
