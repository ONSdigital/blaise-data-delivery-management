import jwt from "jsonwebtoken";

import getGoogleAuthToken from "./googleTokenProvider.js";

type AuthLogger = {
  warn: (message: string) => void;
  error: (err: unknown, message?: string) => void;
};

export default class AuthProvider {
  private readonly DDS_CLIENT_ID: string;
  private readonly logger: AuthLogger;
  private token: string;

  constructor(DDS_CLIENT_ID: string, logger: AuthLogger) {
    this.DDS_CLIENT_ID = DDS_CLIENT_ID;
    this.logger = logger;
    this.token = "";
  }

  async getAuthHeader(): Promise<{ Authorization: string }> {
    if (!this.isValidToken()) {
      this.token = await getGoogleAuthToken(this.DDS_CLIENT_ID, this.logger);
    }

    return { Authorization: `Bearer ${this.token}` };
  }

  private isValidToken(): boolean {
    if (this.token === "") {
      return false;
    }

    const decodedToken = jwt.decode(this.token, { json: true });

    if (decodedToken === null) {
      this.logger.warn("Failed to decode token, calling for new Google auth token");

      return false;
    } else if (decodedToken["exp"] == undefined) {
      this.logger.warn("Token expiry is undefined, calling for new Google auth token");

      return false;
    } else if (AuthProvider.hasTokenExpired(decodedToken["exp"])) {
      this.logger.warn("Auth token expired, calling for new Google auth token");

      return false;
    }

    return true;
  }

  private static hasTokenExpired(expireTimestamp: number): boolean {
    return expireTimestamp < Math.floor(new Date().getTime() / 1000);
  }
}
