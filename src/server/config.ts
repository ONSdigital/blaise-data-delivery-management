export interface EnvironmentVariables {
  PROJECT_ID: string;
  DDS_API_URL: string;
  DDS_CLIENT_ID: string;
}

type RequiredConfigEnv = {
  [TKey in keyof EnvironmentVariables]: string | undefined;
};

type ResolvedRequiredConfigEnv = {
  [TKey in keyof EnvironmentVariables]: string;
};

export function getEnvironmentVariables(): EnvironmentVariables {
  const { PROJECT_ID, DDS_API_URL, DDS_CLIENT_ID } = process.env;

  const requiredEnv: RequiredConfigEnv = {
    PROJECT_ID,
    DDS_API_URL,
    DDS_CLIENT_ID,
  };

  assertResolvedRequiredEnv(requiredEnv);

  return requiredEnv;
}

function assertResolvedRequiredEnv(
  env: RequiredConfigEnv,
): asserts env is ResolvedRequiredConfigEnv {
  const missing = Object.entries(env)
    .filter(([name, value]) => !value || value.trim() === "" || value === `_${name}`)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
