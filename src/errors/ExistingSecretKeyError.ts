export default class ExistingSecretKeyError extends Error {
  constructor({ keyName }: { keyName: string }) {
    super(`Existing secret key name: ${keyName}`);
    this.name = 'ExistingSecretKeyError';
  }
}
