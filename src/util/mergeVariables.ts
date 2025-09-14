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

export default function mergeVariables({ incomingEnvVars, variables, cwd }: Options): EnvVars {
  const envVars: EnvVars = new EnvVars(incomingEnvVars);
  logger.debug(`Incoming env var keys ${Object.keys(envVars)}`);

  const derivationOrder = getDerivationOrder(variables);
  const otherSourceVars = variables ? Object.keys(variables).filter((k) => !(k in envVars)) : [];
  const otherIncomingVars = Object.keys(envVars).filter((k) => !derivationOrder.includes(k));
  const varsToProcess = [...otherIncomingVars, ...otherSourceVars, ...derivationOrder];

  logger.debug(`Var process order: ${varsToProcess}`);

  varsToProcess.forEach((varName) => {
    if (variables && varName in variables) {
      logger.debug(`Processing variable ${varName} from source file`);
      const def = variables[varName];
      const value = processVariable({ def, cwd, envVars });
      envVars.set(varName, value);
    } else if (varName in envVars) {
      logger.debug(`No change in variable ${varName}, using existing value`);
    } else {
      throw new Error(`Variable ${varName} not found in source file or environment`);
    }
  });

  return envVars;
}
