import z from 'zod';

export default z.object({
  version: z.literal('v0').optional(),
  keys: z.object({
    read_write: z.object({
      via: z.string(),
    }),
    read_only: z
      .object({
        via: z.string(),
      })
      .optional(),
  }),
  redact_secrets: z.boolean().optional().default(true),
  sources: z.record(z.string(), z.array(z.string())),
});
