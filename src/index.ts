import 'source-map-support/register';
import { program } from 'commander';

import { compileCommandHandler } from '@/commands/compile';
import GlobalOptionsSchema from '@/GlobalOptionsSchema';
import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import { getGitRoot } from '@/util/git';
import config from '@/util/config';
import { exit } from 'node:process';
import { keyInitCommandHandler } from './commands/keyInit';

program
  .name('repoenv')
  .version('0.1.0')
  .option('-v, --verbose', 'increase verbosity', (_, previous: number) => previous + 1, 0)
  .option('-q, --quiet', 'no logs')
  .option('--no-color', 'disable colorful logs')
  .option('--json', 'output as JSON', false)
  .option('-c, --config <path>', 'config file path');

program.hook('preAction', (_, command) => {
  const opts = GlobalOptionsSchema.parse(program.opts());

  logger.setColor(opts.color);
  logger.setCalculatedLevel({ quiet: opts.quiet, verbose: opts.verbose });

  logger.debug(({ cyan }) => `Repo root: ${cyan(getGitRoot())}`);

  config.load(opts.config);

  (command as GlobalCommand).globals = opts;
});

program
  .command('compile')
  .description("compile service's env vars")
  .argument('[service]', 'env file to compile')
  .option('--keys-only', 'show only keys, no values', false)
  .action(compileCommandHandler);

program
  .command('keyinit')
  .description('initialize a new secret key')
  .argument('<keyname>', 'key name to initialize')
  .option('--algorithm <algorithm>', 'algorithm to use', 'aes-256-gcm')
  .action(keyInitCommandHandler);

program.parseAsync().catch((err) => {
  logger.error((err as Error).message);
  exit(1);
});
