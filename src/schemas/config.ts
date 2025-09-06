import { z } from 'zod';

import v0 from './versions/config/v0';

const schemaVersions = [v0] as const;

const configSchema = z.discriminatedUnion('version', schemaVersions);

export type Config = z.infer<typeof configSchema>;

export default configSchema;
