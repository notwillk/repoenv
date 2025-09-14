import EnvVars from '@/util/EnvVars';
import getDerivationOrder from '@/util/getDerivationOrder';
import processVariable from '@/util/processVariable';
import logger from '@/util/logger';
import { Variables } from '@/schemas/versions/source/v0';

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
  const otherSourceVars = variables ? Object.keys(variables).filter((k) => !envVars.has(k)) : [];
  const otherIncomingVars = envVars.keys().filter((k) => !derivationOrder.includes(k));
  const varsToProcess = [...otherIncomingVars, ...otherSourceVars, ...derivationOrder];

  logger.debug(`Var process order: ${varsToProcess}`);

  await Promise.all(
    varsToProcess.map(async (varName) => {
      if (variables && varName in variables) {
        logger.debug(`Processing variable ${varName} from source file`);
        const def = variables[varName];
        const value = await processVariable({ def, cwd, envVars });
        envVars.set(varName, value);
      } else if (envVars.has(varName)) {
        logger.debug(`No change in variable ${varName}, using existing value`);
      } else {
        throw new Error(`Variable ${varName} not found in source file or environment`);
      }
    }),
  );

  return envVars;
}
