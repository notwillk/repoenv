export default class UndefinedServiceError extends Error {
  constructor({ serviceName }: { serviceName: string }) {
    super(`Undefined service: ${serviceName}`);
    this.name = 'UndefinedServiceError';
  }
}
