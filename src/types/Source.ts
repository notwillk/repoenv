import z from 'zod';
import SourceSchema from '@/schemas/source';

type Source = z.infer<typeof SourceSchema>;

export type VariableDefinition = Source['vars'][string];

export function isPlainStringVariableDefinition(v: VariableDefinition): v is string {
  return typeof v === 'string';
}

export function isValueVariableDefinition(
  v: VariableDefinition,
): v is Extract<VariableDefinition, { value: string }> {
  return v.hasOwnProperty('value');
}

export function isSubstitutionVariableDefinition(
  v: VariableDefinition,
): v is Extract<VariableDefinition, { substitution: string }> {
  return v.hasOwnProperty('substitution');
}

export function isEncryptedVariableDefinition(
  v: VariableDefinition,
): v is Extract<VariableDefinition, { encrypted: string }> {
  return v.hasOwnProperty('encrypted');
}
