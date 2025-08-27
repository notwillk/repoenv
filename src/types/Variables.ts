import z from 'zod';
import VariablesSchema from '@/schemas/variables';

type Variables = z.infer<typeof VariablesSchema>;

export type VariableDefinition = Variables['vars'][string];

export function isPlainStringVariableDefinition(v: VariableDefinition): v is string {
  return typeof v === 'string';
}

export function isValueVariableDefinition(
  v: VariableDefinition,
): v is Extract<VariableDefinition, { value: string }> {
  return v.hasOwnProperty('value');
}

export function isDerivedVariableDefinition(
  v: VariableDefinition,
): v is Extract<VariableDefinition, { derived_value: string }> {
  return v.hasOwnProperty('derived_value');
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
