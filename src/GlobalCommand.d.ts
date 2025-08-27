import { Command } from 'commander';
import { z } from 'zod';
import GlobalOptionsSchema from '@/GlobalOptionsSchema';

type GlobalCommand = Command & { globals: z.infer<typeof GlobalOptionsSchema> };

export default GlobalCommand;
