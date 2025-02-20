/**
 * Validates that required environment variables are set
 *
 * @param requiredVars - Array of environment variable names that must be set
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
export function validateEnvironment(requiredVars: readonly string[]): void {
  const missingVars: string[] = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    throw new Error("Missing required environment variables");
  }
} 