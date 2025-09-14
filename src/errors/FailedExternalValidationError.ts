export default class FailedExternalValidationError extends Error {
  constructor() {
    super('External validation failed');
    this.name = 'FailedExternalValidationError';
  }
}
