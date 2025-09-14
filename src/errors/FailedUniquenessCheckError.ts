export default class FailedUniquenessCheckError extends Error {
  constructor(opts: { variable: string; value: string; conflictingVariable: string }) {
    super(
      `Uniqueness check failed for variable ${opts.variable} with value ${opts.value}, same as ${opts.conflictingVariable}`,
    );
    this.name = 'FailedUniquenessCheckError';
  }
}
