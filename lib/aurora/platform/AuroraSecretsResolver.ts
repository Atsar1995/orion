/** Dev fallback secrets resolver (A-007 interface only). */

export interface AuroraSecretsResolver {
  resolve(secretName: string): Promise<string | null>;
}

export class EnvAuroraSecretsResolver implements AuroraSecretsResolver {
  async resolve(secretName: string): Promise<string | null> {
    const envKey = secretName.toUpperCase().replace(/[.-]/g, "_");
    return process.env[envKey] ?? null;
  }
}
