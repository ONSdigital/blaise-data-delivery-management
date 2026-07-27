import { GoogleAuth } from "google-auth-library";

export default async function getGoogleAuthToken(targetAudience: string): Promise<string> {
    try {
        const client = await new GoogleAuth().getIdTokenClient(targetAudience);

        return await client.idTokenProvider.fetchIdToken(targetAudience);
    } catch (error) {
        console.error("Could not get the Google auth token credentials", error);

        return "";
    }
}
