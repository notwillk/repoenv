import { z } from 'zod';

const GlobalOptionsSchema = z.object({
  verbose: z.number().optional().default(0),
  quiet: z.boolean().optional().default(false),
  color: z.boolean().optional().default(true),
});

export default GlobalOptionsSchema;
