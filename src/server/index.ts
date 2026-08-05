import dotenv from "dotenv";

import { getEnvironmentVariables } from "./config.js";
import { newServer } from "./server.js";
import createLogger from "./utils/createLogger.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const environmentVariables = getEnvironmentVariables();
const httpLogger = createLogger();
const app = newServer(environmentVariables, httpLogger);

const port: string = process.env.PORT || "5000";

app
  .listen(port, () => {
    httpLogger.logger.info(`App is listening on port ${port}`);
  })
  .on("error", (err: Error) => {
    httpLogger.logger.error(err, "Failed to start server");
    process.exit(1);
  });
