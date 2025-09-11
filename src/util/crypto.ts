import crypto from 'node:crypto';

type EncryptFunction = (options: {
  plaintext: string;
  key: string;
  encoding: BufferEncoding;
}) => string;

type DecryptFunction = (options: {
  ciphertext: string;
  key: string;
  encoding: BufferEncoding;
}) => string;

type GenerateKeyFunction = () => string;

export const aes256GcmGenerateKey: GenerateKeyFunction = () => {
  return crypto.randomBytes(32).toString('base64');
};

export const aes256GcmEncrypt: EncryptFunction = ({ plaintext, key, encoding }): string => {
  const keyBuffer = Buffer.from(key, 'base64');
  const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString(encoding);
};

export const aes256GcmDecrypt: DecryptFunction = ({ ciphertext, key, encoding }): string => {
  const keyBuffer = Buffer.from(key, 'base64');
  const data = Buffer.from(ciphertext, encoding);

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};
