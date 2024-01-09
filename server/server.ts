import express, { Request, Response } from "express";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { getEnvironmentVariables } from "./Config";
import createLogger from "./pino";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: __dirname + "/../../.env" });
}

const server = express();
const logger = createLogger();
server.use(logger);

import DataDeliveryTrigger from "./DataDeliveryTrigger";
import DataDeliveryStatus from "./DataDeliveryStatus";

// where ever the react built package is
const buildFolder = "../../build";

// load the .env variables in the server
const environmentVariables = getEnvironmentVariables();

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

// Endpoint to trigger data delivery Azure pipeline
server.use("/", DataDeliveryTrigger(environmentVariables, logger));

// All Endpoints calling the Data Delivery Status API
server.use("/", DataDeliveryStatus(environmentVariables, logger));

// Health Check endpoint
server.get("/ddm-ui/:version/health", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.status(200).json({ healthy: true });
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

server.use(function (err: Error, req: Request, res: Response) {
    logger(req, res);
    req.log.error(err, err.message);
    res.render("../views/500.html", {});
});

export default server;
