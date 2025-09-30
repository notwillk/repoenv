export default class UndefinedServiceFileError extends Error {
  constructor({ path }: { path: string }) {
    super(`Undefined service file: ${path}`);
    this.name = 'UndefinedServiceFileError';
  }
}
