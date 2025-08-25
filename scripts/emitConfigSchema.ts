import { z } from 'zod';
import ConfigSchema from '../src/schemas/config';

const jsonSchema = z.toJSONSchema(ConfigSchema, { target: 'draft-7' });
console.log(JSON.stringify(jsonSchema, null, 2));
