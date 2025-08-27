import { z } from 'zod';
import SourceSchema from '../src/schemas/source';

const jsonSchema = z.toJSONSchema(SourceSchema, { target: 'draft-7' });
console.log(JSON.stringify(jsonSchema, null, 2));
