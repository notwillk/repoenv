export default class ConfigFileExistsError extends Error {
  constructor({ configPath }: { configPath: string }) {
    super(`Config file exists: ${configPath}`);
    this.name = 'ConfigFileExistsError';
  }
}
