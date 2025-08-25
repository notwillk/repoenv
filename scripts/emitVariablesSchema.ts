import { z } from 'zod';
import VariablesSchema from '../src/schemas/variables';

const jsonSchema = z.toJSONSchema(VariablesSchema);
console.log(JSON.stringify(jsonSchema, null, 2));
