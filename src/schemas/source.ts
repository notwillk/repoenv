import { z } from 'zod';

import v0 from './versions/source/v0';

const schemaVersions = [v0] as const;

const sourceSchema = z.discriminatedUnion('version', schemaVersions);

export type Source = z.infer<typeof sourceSchema>;

export default sourceSchema;
