import { z } from 'zod';

import v0 from './versions/config/v0';

const schemaVersions = [v0] as const;

export default z.discriminatedUnion('version', schemaVersions);
