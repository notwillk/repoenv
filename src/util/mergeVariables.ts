import EnvVars from '@/util/EnvVars';
import getDerivationOrder from '@/util/getDerivationOrder';
import processVariable from '@/util/processVariable';
import logger from '@/util/logger';
import { Variables } from '@/schemas/versions/service/v0';
import { isPlainStringVariable } from '@/schemas/versions/variable';
import FailedUniquenessCheckError from '@/errors/FailedUniquenessCheckError';

type Options = {
  incomingEnvVars: EnvVars;
  variables: Variables;
  cwd: string;
};

export default async function mergeVariables({
  incomingEnvVars,
  variables,
  cwd,
}: Options): Promise<EnvVars> {
  const envVars: EnvVars = new EnvVars(incomingEnvVars);
  logger.debug(`Incoming env var keys ${Object.keys(envVars)}`);

  const derivationOrder = getDerivationOrder(variables);
  const otherServiceVars = variables ? Object.keys(variables).filter((k) => !envVars.has(k)) : [];
  const otherIncomingVars = envVars.keys().filter((k) => !derivationOrder.includes(k));
  const varsToProcess = [...otherIncomingVars, ...otherServiceVars, ...derivationOrder];

  logger.debug(`Var process order: ${varsToProcess}`);

  await Promise.all(
    varsToProcess.map(async (varName) => {
      if (variables && varName in variables) {
        logger.debug(`Processing variable ${varName} from service file`);
        const def = variables[varName];
        const value = await processVariable({ def, cwd, envVars });
        envVars.set(varName, value);
      } else if (envVars.has(varName)) {
        logger.debug(`No change in variable ${varName}, using existing value`);
      } else {
        throw new Error(`Variable ${varName} not found in service file or environment`);
      }
    }),
  );

  varsToProcess.forEach((varName) => {
    if (variables && varName in variables) {
      const def = variables[varName];
      if (!isPlainStringVariable(def)) {
        const { unique } = def;
        if (unique !== undefined) {
          logger.debug(`Checking variable ${varName} for uniqueness`);
          const maybeUniqueEnvVars = envVars.filter(unique);
          const value = envVars.get(varName).getValue();
          maybeUniqueEnvVars.entries().forEach(([otherVar, otherValue]) => {
            const good = otherValue.getValue() !== value || otherVar === varName;
            if (!good) {
              throw new FailedUniquenessCheckError({
                variable: varName,
                value: String(value),
                conflictingVariable: otherVar,
              });
            }
          });
        }
      }
    }
  });

  return envVars;
}
