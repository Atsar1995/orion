/** Base class for Executive Intelligence Platform errors. */
export class IntelligencePlatformError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntelligencePlatformError";
  }
}

/** Thrown when a provider id is already registered. */
export class ProviderAlreadyRegisteredError extends IntelligencePlatformError {
  constructor(providerId: string) {
    super(`Provider already registered: ${providerId}`);
    this.name = "ProviderAlreadyRegistered";
  }
}

/** Thrown when a provider id is not found in the registry. */
export class ProviderNotFoundError extends IntelligencePlatformError {
  constructor(providerId: string) {
    super(`Provider not found: ${providerId}`);
    this.name = "ProviderNotFound";
  }
}

/** Thrown when a provider fails validation. */
export class InvalidProviderError extends IntelligencePlatformError {
  constructor(message: string) {
    super(`Invalid provider: ${message}`);
    this.name = "InvalidProvider";
  }
}

/** Thrown when a provider version is not supported. */
export class VersionMismatchError extends IntelligencePlatformError {
  constructor(providerVersion: string, supportedVersions: readonly string[]) {
    super(
      `Provider version mismatch: ${providerVersion}. Supported: ${supportedVersions.join(", ")}`,
    );
    this.name = "VersionMismatch";
  }
}

/** Thrown when provider registration fails. */
export class RegistrationFailedError extends IntelligencePlatformError {
  constructor(message: string) {
    super(`Registration failed: ${message}`);
    this.name = "RegistrationFailed";
  }
}
