import fs from 'node:fs';
import { stringify } from 'yaml';
import { z } from 'zod';

import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import config from '@/configs/config';
import ConfigFileExistsError from '@/errors/ConfigFileExistsError';
import DEFAULT_CONFIG from '@/defaults/config';
import defaultConfigPath from '@/util/defaultConfigPath';

const OptionsSchema = z.object({});

export async function initCommandHandler(
  maybeConfigPath: string,
  maybeOptions: z.infer<typeof OptionsSchema>,
  command: GlobalCommand,
): Promise<void> {
  const options = OptionsSchema.parse(maybeOptions);
  logger.debug('Options', options);
  logger.debug('Globals', command.globals);

  if (config.configPath && fs.existsSync(config.configPath)) {
    logger.debug(`Found existing config: ${config.configPath}`);
    throw new ConfigFileExistsError({ configPath: config.configPath });
  }

  logger.debug(`Specified config file: ${maybeConfigPath}`);
  const configPath = maybeConfigPath || defaultConfigPath();

  if (fs.existsSync(configPath)) {
    logger.debug(`Found existing config file: ${configPath}`);
    throw new ConfigFileExistsError({ configPath });
  }

  logger.debug(`New config file at: ${configPath}`);

  fs.writeFileSync(configPath, stringify(DEFAULT_CONFIG));

  logger.info(`Config created at ${configPath}`);
}
