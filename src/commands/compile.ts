import { z } from 'zod';

import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import output from '@/util/output';
import { EnvVars } from '@/types/EnvVars';
import processSourceFile from '@/util/sourceFile/processSourceFile';

const OptionsSchema = z.object({
  service: z.string().optional(),
  redact: z.boolean().optional().default(true),
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
  logger.info(({ yellow }) => yellow('Compile command scaffold'));

  const envVars = filePath
    ? processSourceFile({
        filePath,
        decryptionKey: 'TBD',
        incomingEnvVars: process.env,
      })
    : process.env;

  const format = command.globals.json ? 'json' : 'dotenv';
  output(envVars, { format });
}
