import { z } from 'zod';

import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import output from '@/util/output';
import processSourceFile from '@/util/sourceFile/processSourceFile';
import config from '@/util/config';
import mergeVariables from '@/util/mergeVariables';
import EnvVars from '@/util/EnvVars';
import UndefinedServiceError from '@/errors/UndefinedServiceError';

const OptionsSchema = z.object({
  keysOnly: z.boolean().optional().default(false),
});

export async function compileCommandHandler(
  serviceName: string,
  maybeOptions: z.infer<typeof OptionsSchema>,
  command: GlobalCommand,
): Promise<void> {
  const options = OptionsSchema.parse(maybeOptions);
  logger.debug('Options', options);
  logger.debug('Globals', command.globals);

  const inbound_filter = config?.data?.inbound_filter;
  const processEnvVars = EnvVars.fromObject(process.env);

  const incomingEnvVars = inbound_filter ? processEnvVars.filter(inbound_filter) : processEnvVars;

  const sourceEnvVars =
    config.data?.vars && config.configPath
      ? await mergeVariables({
          incomingEnvVars,
          variables: config.data?.vars,
          cwd: config.configPath,
        })
      : incomingEnvVars;

  const filePath = config.sources[serviceName] || null;

  if (serviceName && !filePath) {
    throw new UndefinedServiceError({ serviceName });
  }

  const envVars = filePath
    ? await processSourceFile({
        filePath,
        incomingEnvVars: sourceEnvVars,
      })
    : sourceEnvVars;

  const format = command.globals.json ? 'json' : 'dotenv';
  output(envVars, { format, keysOnly: options.keysOnly });
}
