import process = require("process");
import path = require("path");
import dotenv = require("dotenv");
import { setUpServer } from "./setUpServer";
import { MongoClient } from "mongodb";

const enum ExitCode {
    UNKNOWN_ARGUMENT = 1,
    MONGO_ERROR = 2,
    SERVER_SETUP_ERROR = 3
}

function readEnvironmentVars() {
    if (process.env.NODE_ENV === "production") { // NODE_ENV should be set from the command line (see package.json)
        dotenv.config({path: path.resolve(process.cwd(), ".env.production.local")});
        dotenv.config({path: path.resolve(process.cwd(), ".env.production")});
    } else if (process.env.NODE_ENV === "development") {
        dotenv.config({path: path.resolve(process.cwd(), ".env.development.local")});
        dotenv.config({path: path.resolve(process.cwd(), ".env.development")});
    } else {
        console.warn("[WARN] Neither production or development environment set.");
    }
    dotenv.config(); // Load `.env` in the current working dir.  This won't override any already-set variables.
}

/**
 * Main entry point.  Starts the server.
 *
 * @param argv - command line arguments.  Unused for now.
 */
async function main(argv: string[]) { // eslint-disable-line @typescript-eslint/no-unused-vars
    readEnvironmentVars();

    if (!process.env.MONGODB_URI) {
        throw new Error("MongoDB URI must be specified in the environment variables.");
    } else if (!process.env.PORT) {
        throw new Error("PORT must be specified in the environment variables.");
    }

    // Connect to MongoDB
    let mongoClient;
    try {
        console.log(`🛠 Attempting to establish MongoDB connection at <${process.env.MONGODB_URI}>...`);
        mongoClient = await MongoClient.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Database connection successful.");
    } catch (error) {
        console.error(error.toString());
        console.error("❌ Couldn't establish a MongoDB connection; aborting.");
        process.exit(ExitCode.MONGO_ERROR);
    }

    // Set up server
    let server;
    try {
        const serverOptions = {
            port: Number.parseInt(process.env.PORT),
            host: process.env.HOST
        };
        console.log("🛠 Attempting to start server with the following options:");
        console.log(serverOptions);
        server = await setUpServer(mongoClient, serverOptions);
        await server.start();
        console.log(`✅ Server running at ${server.info.uri}`);
    } catch (error) {
        console.error(error);
        console.error("❌ There was a problem setting up the server; aborting.");
        process.exit(ExitCode.SERVER_SETUP_ERROR);
    }

    // Set up callbacks after server has started
    process.on("SIGINT", async function () {
        console.log("Stopping server...");
        await server.stop();
        process.exit(0);
    });
    process.on("unhandledRejection", console.error);
}

if (require.main === module) { // Called directly
    main(process.argv);
} // else required as a module
