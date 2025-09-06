import { z } from 'zod';

import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import output from '@/util/output';
import processSourceFile from '@/util/sourceFile/processSourceFile';
import config from '@/util/config';
import filterVariables from '@/util/sourceFile/filterVariables';
import mergeVariables from '@/util/mergeVariables';

const OptionsSchema = z.object({
  keysOnly: z.boolean().optional().default(false),
});

export function compileCommandHandler(
  filePath: string,
  maybeOptions: z.infer<typeof OptionsSchema>,
  command: GlobalCommand,
): void | Promise<void> {
  const options = OptionsSchema.parse(maybeOptions);
  logger.debug('Options', options);
  logger.debug('Globals', command.globals);

  const inbound_filter = config?.data?.inbound_filter;

  const incomingEnvVars = inbound_filter
    ? filterVariables({ envVars: process.env, filters: inbound_filter })
    : process.env;

  const sourceEnvVars =
    config.data?.vars && config.configPath
      ? mergeVariables({ incomingEnvVars, variables: config.data?.vars, cwd: config.configPath })
      : incomingEnvVars;

  const envVars = filePath
    ? processSourceFile({
        filePath,
        incomingEnvVars: sourceEnvVars,
      })
    : sourceEnvVars;

  const format = command.globals.json ? 'json' : 'dotenv';
  output(envVars, { format, keysOnly: options.keysOnly });
}
