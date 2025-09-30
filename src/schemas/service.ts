import { z } from 'zod';

import v0 from './versions/service/v0';

const schemaVersions = [v0] as const;

const serviceSchema = z.discriminatedUnion('version', schemaVersions);

export type Service = z.infer<typeof serviceSchema>;

export default serviceSchema;
