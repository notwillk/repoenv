export default class UninitializedConfigError extends Error {
  constructor() {
    super(`repoenv is not initialized. Please run 'repoenv init' first.`);
    this.name = 'UninitializedConfigError';
  }
}
