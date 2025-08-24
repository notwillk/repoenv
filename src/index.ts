import 'source-map-support/register';

import { program } from 'commander';

program
  .name('repoenv')
  .version('0.1.0')
  .action(() => console.log('repoenv bundled CLI ✅'));
program.parse();
