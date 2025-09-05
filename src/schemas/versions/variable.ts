import z from 'zod';

import { getFormatRegex } from '@/util/formats';
import { ENV_VAR_NAME_PATTERN } from '@/constants';

export const STATIC_FORMATS = ['url', 'iso8601', 'email', 'ipv4', 'ipv6', 'uuid', 'ulid'] as const;
export const INTEGER_MODIFIED_FORMATS = ['string', 'base64', 'hex', 'integer'] as const;
export const FLOAT_MODIFIED_FORMATS = ['float'] as const;

const formatRexexp = getFormatRegex({
  staticFormats: STATIC_FORMATS,
  integerModifiedFormats: INTEGER_MODIFIED_FORMATS,
  floatModifiedFormats: FLOAT_MODIFIED_FORMATS,
});

const baseVar = z.object({
  format: z.string().regex(formatRexexp).optional(),
  regexp: z.string().optional(),
  validator: z.string().optional(),
  redact: z.boolean().optional(),
  unique: z.array(z.string()).optional(),
});

export const plainStringVariableSchema = z.string();

export const valueVariableSchema = baseVar.extend({
  value: z.string(),
});

export const substitutionVariableSchema = baseVar.extend({
  substitution: z.string(),
});

export const encryptedVariableSchema = baseVar.extend({
  encrypted: z.string(),
});

export const variableSchema = z.union([
  plainStringVariableSchema,
  valueVariableSchema,
  substitutionVariableSchema,
  encryptedVariableSchema,
]);

export type Variable = z.infer<typeof variableSchema>;

export type PlainStringVariable = z.infer<typeof plainStringVariableSchema>;
export type ValueVariable = z.infer<typeof valueVariableSchema>;
export type SubstitutionVariable = z.infer<typeof substitutionVariableSchema>;
export type EncryptedVariable = z.infer<typeof encryptedVariableSchema>;

export function isPlainStringVariable(v: Variable): v is PlainStringVariable {
  return typeof v === 'string';
}

export function isValueVariable(v: Variable): v is ValueVariable {
  return v.hasOwnProperty('value');
}

export function isSubstitutionVariable(v: Variable): v is SubstitutionVariable {
  return v.hasOwnProperty('substitution');
}

export function isEncryptedVariable(v: Variable): v is EncryptedVariable {
  return v.hasOwnProperty('encrypted');
}

export const VariableNameSchema = z.string().regex(new RegExp(`^${ENV_VAR_NAME_PATTERN}$`));
