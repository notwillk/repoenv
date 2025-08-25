import { z } from 'zod';

const GlobalOptionsSchema = z.object({
  verbose: z.boolean().optional().default(false),
  quiet: z.boolean().optional().default(false),
  color: z.boolean().optional().default(true),
});

export default GlobalOptionsSchema;
