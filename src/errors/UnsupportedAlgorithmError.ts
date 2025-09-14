export default class UnsupportedAlgorithmError extends Error {
  constructor({ algorithm }: { algorithm: string }) {
    super(`Unsupported algorithm: ${algorithm}`);
    this.name = 'UnsupportedAlgorithmError';
  }
}
