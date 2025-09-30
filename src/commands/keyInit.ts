import fs from 'node:fs';
import { z } from 'zod';
import { parseDocument } from 'yaml';

import GlobalCommand from '@/GlobalCommand';
import logger from '@/util/logger';
import config from '@/configs/config';
import ExistingSecretKeyError from '@/errors/ExistingSecretKeyError';
import UninitializedConfigError from '@/errors/UninitializedConfigError';
import { KeyTypeSchema } from '@/schemas/versions/config/v0';
import DEFAULT_SECRET_KEYS from '@/defaults/secretKeys';
import UnsupportedAlgorithmError from '@/errors/UnsupportedAlgorithmError';

const OptionsSchema = z.object({
  algorithm: KeyTypeSchema.optional().default('aes-256-gcm'),
});

function getDefaultKeyDefinition(
  maybeAlgorithm: z.infer<typeof KeyTypeSchema>,
): (typeof DEFAULT_SECRET_KEYS)[number] | null {
  return DEFAULT_SECRET_KEYS.find((def) => def.scheme === maybeAlgorithm) || null;
}

export async function keyInitCommandHandler(
  keyName: string,
  maybeOptions: z.infer<typeof OptionsSchema>,
  command: GlobalCommand,
): Promise<void> {
  const options = OptionsSchema.parse(maybeOptions);
  const { algorithm } = options;
  logger.debug('Options', options);
  logger.debug('Globals', command.globals);

  const { configPath, data } = config;
  if (!configPath) {
    throw new UninitializedConfigError();
  }

  const existingKeys = Object.keys(data?.keys || {});

  if (existingKeys.includes(keyName)) {
    throw new ExistingSecretKeyError({ keyName });
  }
  logger.debug(`Secret key name (${keyName}) does not exist already`);

  const src = fs.readFileSync(configPath, 'utf8');
  const doc = parseDocument(src);

  if (!doc.get('keys', true)) {
    logger.debug(`Added new keys section`);
    doc.setIn(['keys'], doc.createNode({}, { flow: true }));
  } else {
    logger.debug(`Keys section already exists`);
  }

  const maybeDefinition = getDefaultKeyDefinition(algorithm);

  if (!maybeDefinition) {
    throw new UnsupportedAlgorithmError({ algorithm });
  }

  doc.setIn(['keys', keyName], maybeDefinition);

  logger.debug(`Writing updated config to ${configPath}`);
  fs.writeFileSync(configPath, String(doc));

  logger.info('Config updsated');
}
