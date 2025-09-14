import path from 'node:path';

import EnvVars from '@/util/EnvVars';
import SourceSchema from '@/schemas/source';
import readFile from '@/util/readFile';

import logger from '../logger';
import mergeVariables from '../mergeVariables';

type Options = { filePath: string; incomingEnvVars?: EnvVars };

export default async function processSourceFile({ filePath, incomingEnvVars }: Options) {
  logger.debug(`Processing file ${filePath}`);

  const source = readFile(filePath, SourceSchema);
  const envVars = await mergeVariables({
    incomingEnvVars: incomingEnvVars ? incomingEnvVars : new EnvVars(),
    variables: source.vars,
    cwd: path.dirname(path.resolve(filePath)),
  });

  return source.filter ? envVars.filter(source.filter) : envVars;
}
