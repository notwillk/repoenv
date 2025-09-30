import { z } from 'zod';
import ServiceSchema from '../src/schemas/service';

const jsonSchema = z.toJSONSchema(ServiceSchema, { target: 'draft-7' });
console.log(JSON.stringify(jsonSchema, null, 2));
