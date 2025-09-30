import z from 'zod';
import { variablesSchema } from '../service/v0';
import { VariableNameSchema } from '../variable';

const KeyUpdateSchema = z.object({
  cmd: z.string(),
});

export const Aes256GcmKeySchema = z.object({
  scheme: z.literal('aes-256-gcm'),
  // format: z.string(),
  update: KeyUpdateSchema,
});

export const X25519KeySchema = z.object({
  scheme: z.literal('x25519'),
  // format: z.string(),
  update: z.object({ encrypt: KeyUpdateSchema, decrypt: KeyUpdateSchema }),
});

export const Ed25519KeySchema = z.object({
  scheme: z.literal('ed25519'),
  // format: z.string(),
  update: z.object({ sign: KeyUpdateSchema, verify: KeyUpdateSchema }),
});

const KeySchema = z.discriminatedUnion('scheme', [
  Aes256GcmKeySchema,
  X25519KeySchema,
  Ed25519KeySchema,
]);

export const KeyTypeSchema = z.enum(KeySchema.options.map((schema) => schema.shape.scheme.value));

export default z.object({
  version: z.literal('v0').optional(),
  inbound_filter: z.array(z.string()).optional(),
  vars: variablesSchema.optional().default({}),
  keys: z.record(VariableNameSchema, KeySchema).optional().default({}),
  services: z.record(z.string(), z.string()).optional().default({}),
});
