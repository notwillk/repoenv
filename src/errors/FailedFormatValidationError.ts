export default class FailedFormatValidationError extends Error {
  constructor({ format }: { format: string }) {
    super(`Format validation failed: ${format}`);
    this.name = 'FailedFormatValidationError';
  }
}
