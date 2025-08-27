import z from 'zod';

const KeySchema = z.union([
  z.object({
    var_name: z.string(),
  }),
  z.object({
    substitution: z.string(),
  }),
]);

export default z.object({
  version: z.literal('v0').optional(),
  keys: z.object({
    read_write: KeySchema,
    read_only: KeySchema.optional(),
  }),
  redact_secrets: z.boolean().optional().default(true),
  sources: z.record(z.string(), z.array(z.string())),
});
