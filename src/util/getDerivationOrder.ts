import toposort from 'toposort';

import extractVars from '@/util/extractVars';
import {
  isEncryptedVariable,
  isSubstitutionVariable,
  isValueVariable,
} from '@/schemas/versions/variable';
import logger from './logger';
import { Variables } from '@/schemas/versions/source/v0';

export function getDerivationDependencies(vars: Variables): Array<[string, string | undefined]> {
  const edges: Array<[string, string | undefined]> = [];

  for (const [varName, varDef] of Object.entries(vars || {})) {
    let toExtract: string | null = null;
    let singleDependency: string | null = null;

    if (isSubstitutionVariable(varDef)) {
      logger.debug(`Variable ${varName} is substitution based`);
      toExtract = varDef.substitution;
    } else if (isValueVariable(varDef)) {
      logger.debug(`Variable ${varName} is value based`);
      toExtract = varDef.value;
    } else if (isEncryptedVariable(varDef)) {
      logger.debug(`Variable ${varName} is encrypted`);
      singleDependency = varDef.encryption_key_name;
    }

    if (singleDependency !== null) {
      logger.debug(`Variable ${varName} has single dependency on ${singleDependency}`);
      edges.push([varName, singleDependency]);
    } else if (toExtract === null) {
      logger.debug(`Variable ${varName} has no dependencies`);
      edges.push([varName, undefined]);
    } else {
      const extracted = extractVars(toExtract);
      logger.debug(`Variable ${varName} depends on ${extracted}`);
      extracted.forEach((dep) => {
        edges.push([varName, dep]);
      });
    }
  }

  return edges;
}

export default function getDerivationOrder(vars: Variables): string[] {
  const edges = getDerivationDependencies(vars);
  return toposort(edges).filter(Boolean);
}
