import { GoogleAuth } from "google-auth-library";

type ErrorLogger = {
  error: (err: unknown, message?: string) => void;
};

export default async function getGoogleAuthToken(
  targetAudience: string,
  logger: ErrorLogger,
): Promise<string> {
  try {
    const client = await new GoogleAuth().getIdTokenClient(targetAudience);

    return await client.idTokenProvider.fetchIdToken(targetAudience);
  } catch (error) {
    logger.error(error, "Could not get the Google auth token credentials");

    throw error;
  }
}
