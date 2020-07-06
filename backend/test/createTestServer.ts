import path = require("path");
import dotenv = require("dotenv");
import { Server } from "@hapi/hapi";
import { MockMongoClient } from "./mockObjects/MockMongoClient";

export function createTestServer(client: MockMongoClient): Server {
    dotenv.config({path: path.resolve(process.cwd(), ".env.test.local")});
    dotenv.config({path: path.resolve(process.cwd(), ".env.test")});
    dotenv.config(); // The plain .env file
    const server = new Server({port: 9999, host: "localhost"});
    server.app["mongoClient"] = client;
    return server;
}
