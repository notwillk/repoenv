import { z } from 'zod';

import GlobalCommand from '@/GlobalCommand';
import output from '@/util/output';

const OptionsSchema = z.object({
  service: z.string().optional(),
  redact: z.boolean().optional().default(true),
  keysOnly: z.boolean().optional().default(false),
});

export function compileCommandHandler(
  maybeOptions: z.infer<typeof OptionsSchema>,
  command: GlobalCommand,
): void | Promise<void> {
  const options = OptionsSchema.parse(maybeOptions);
  output.debug('Options', options);
  output.debug('Globals', command.globals);
  output.info(({ yellow }) => yellow('Compile command scaffold'));
}
