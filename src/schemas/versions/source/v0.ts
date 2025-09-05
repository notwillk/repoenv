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

export default z.object({
  version: z.literal('v0').optional(),
  vars: z
    .record(
      z.string().regex(new RegExp(`^${ENV_VAR_NAME_PATTERN}$`)),
      z.union([
        z.string(),
        baseVar.extend({
          value: z.string(),
        }),
        baseVar.extend({
          substitution: z.string(),
        }),
        baseVar.extend({
          encrypted: z.string(),
        }),
      ]),
    )
    .optional(),
  filter: z.array(z.string()).optional(),
  validator: z.string().optional(),
});
