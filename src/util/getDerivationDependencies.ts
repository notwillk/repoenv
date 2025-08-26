import z from 'zod';
import VariablesSchema from '../schemas/variables';
import extractVars from './extractVars';

export default function getDerivationDependencies({
  vars,
}: z.infer<typeof VariablesSchema>): Record<string, string[]> {
  const propertiesWithPossibleDependencies = ['derived_value', 'substitution'] as const;

  let dependencies: Record<string, string[]> = {};
  for (const [varName, varDef] of Object.entries(vars)) {
    if (typeof varDef === 'string') {
      dependencies[varName] = [];
      continue;
    }

    dependencies[varName] = propertiesWithPossibleDependencies.reduce<string[]>((acc, prop) => {
      if (varDef.hasOwnProperty(prop) && (varDef as any)[prop]) {
        const extracted = extractVars((varDef as any)[prop] as string);
        acc.push(...extracted);
      }
      return acc;
    }, []);
  }

  return dependencies;
}
