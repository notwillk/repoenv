import z from 'zod';
import toposort from 'toposort';

import VariablesSchema from '@/schemas/variables';
import extractVars from '@/util/extractVars';

export function getDerivationDependencies(
  vars: z.infer<typeof VariablesSchema>,
): Array<[string, string | undefined]> {
  const propertiesWithPossibleDependencies = ['derived_value', 'substitution'] as const;

  const edges: Array<[string, string | undefined]> = [];
  for (const [varName, varDef] of Object.entries(vars)) {
    if (typeof varDef === 'string') {
      edges.push([varName, undefined]);
      continue;
    }

    propertiesWithPossibleDependencies.forEach((prop) => {
      if (varDef.hasOwnProperty(prop) && (varDef as any)[prop]) {
        const extracted = extractVars((varDef as any)[prop] as string);
        extracted.forEach((dep) => {
          edges.push([varName, dep]);
        });
      }
    });
  }

  return edges;
}

export default function getDerivationOrder(vars: z.infer<typeof VariablesSchema>): string[] {
  const edges = getDerivationDependencies(vars);
  return toposort(edges);
}
