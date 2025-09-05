import toposort from 'toposort';

import extractVars from '@/util/extractVars';
import { Source } from '@/schemas/source';

export function getDerivationDependencies(source: Source): Array<[string, string | undefined]> {
  const propertiesWithPossibleDependencies = ['value', 'substitution'] as const;

  const edges: Array<[string, string | undefined]> = [];
  for (const [varName, varDef] of Object.entries(source)) {
    if (typeof varDef === 'string') {
      edges.push([varName, undefined]);
      continue;
    }

    propertiesWithPossibleDependencies.forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (varDef.hasOwnProperty(prop) && (varDef as any)[prop]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extracted = extractVars((varDef as any)[prop] as string);
        extracted.forEach((dep) => {
          edges.push([varName, dep]);
        });
      }
    });
  }

  return edges;
}

export default function getDerivationOrder(source: Source): string[] {
  const edges = getDerivationDependencies(source);
  return toposort(edges);
}
