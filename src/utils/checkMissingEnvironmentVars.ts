/**
 * Checks if any of the required environment variables are missing.
 * @param requiredEnvVars - An array of required environment variable names.
 * @returns An array of missing environment variable names, or `null` if all required environment variables are present.
 */
export function checkMissingEnvironmentVars(requiredEnvVars: string[]): string[] | null {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  return missingEnvVars.length > 0 ? missingEnvVars : null;
}