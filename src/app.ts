import express, { Application } from "express";
import { startServer } from "./services/startServer";
import dotenv from "dotenv";
import csrf from "csurf";
import { connectDB } from "./services/db/connection";
import { apiRouter } from "./routes";
import { morganMiddleware } from "./middlewares";
import { errorHandler } from "./middlewares";
import { log } from "./utils";
import helmet from "helmet";

dotenv.config({ path: `.env.${process.env['NODE_ENV']}` });

// Check that the required environment variables are set.
{
  const requiredEnvVars = ["MONGO_URI", "PORT"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    log.error(
      `The following environment variables are missing: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }
}

/** The port number to listen on. */
const PORT = parseInt(process.env["PORT"]!) || 9000;
/** The MongoDB URI to connect to. */
const mongoDbURI = process.env["MONGO_URI"]!;


/** The Express application instance. */
const app: Application = express();

// Disable the X-Powered-By header.
// This header is enabled by default in Express and is often used by attackers to determine what server is running.
app.use(helmet.xPoweredBy());

// Enable Cross-Site Request Forgery (CSRF) protection.
// CSRF attacks can allow attackers to perform actions on behalf of authenticated users
// This middleware adds a csrfToken() method to the request object.
// This token is used to validate the request body when making POST requests.
app.use(csrf());

// HTTP request logger middleware
app.use(morganMiddleware);

app.use(express.json());

// load v1 api router
app.use("/api", apiRouter);

// error handler middleware
app.use(errorHandler);

// Connect to the database and start the server.
connectDB(mongoDbURI)
  .then(() => startServer(app, PORT))
  .catch((err: Error) => {
    log.error(err);
  });
