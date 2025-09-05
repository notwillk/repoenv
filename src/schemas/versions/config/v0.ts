import z from 'zod';
import { variablesSchema } from '../source/v0';

export default z.object({
  version: z.literal('v0').optional(),
  inbound_filter: z.array(z.string()).optional(),
  vars: variablesSchema.optional().default({}),
  sources: z.record(z.string(), z.array(z.string())),
});
