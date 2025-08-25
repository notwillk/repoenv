import { z } from 'zod';

import GlobalCommand from '../GlobalCommand';

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
  console.log('Options:', options);
  console.log('Globals:', command.globals);
  console.log('Compile command scaffold');
}
