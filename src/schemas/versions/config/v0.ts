import z from 'zod';

export default z.object({
  version: z.literal('v0').optional(),
  key: z.object({
    via: z.string(),
  }),
  redact_secrets: z.boolean().optional().default(true),
  sources: z.record(z.string(), z.array(z.string())),
});
