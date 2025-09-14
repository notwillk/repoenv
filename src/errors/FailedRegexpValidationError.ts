export default class FailedRegexpValidationError extends Error {
  constructor({ regexp }: { regexp: RegExp }) {
    super(`Value does not match regexp: ${regexp}`);
    this.name = 'FailedRegexpValidationError';
  }
}
