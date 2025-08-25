import 'source-map-support/register';
import { program } from 'commander';

import { compileCommandHandler } from './commands/compile';
import GlobalOptionsSchema from './GlobalOptionsSchema';
import GlobalCommand from './GlobalCommand';

program
  .name('repoenv')
  .version('0.1.0')
  .option('-v, --verbose', 'extra logs')
  .option('-q, --quiet', 'no logs')
  .option('--color / --no-color', 'colorful logs');

program.hook('preAction', ({ error }, command) => {
  const opts = GlobalOptionsSchema.parse(program.opts());

  if (opts.verbose && opts.quiet) {
    error('Choose either --verbose or --quiet (not both).');
  }

  (command as GlobalCommand).globals = opts;
});

program
  .command('compile')
  .description("compile service's env vars")
  .option('-s, --service <service>', 'service name')
  .option('--redact', 'redact secret values', true)
  .option('--no-redact', 'do not redact secret values')
  .option('--keys-only', 'show only keys, no values', false)
  .action(compileCommandHandler);

program.parse();
