import z from 'zod';

import { VariableNameSchema, variableSchema } from '../variable';

export const variablesSchema = z.record(VariableNameSchema, variableSchema);

export type Variables = z.infer<typeof variablesSchema>;

export default z.object({
  version: z.literal('v0').optional(),
  vars: variablesSchema.optional().default({}),
  filter: z.array(z.string()).optional(),
  validator: z.string().optional(),
});
