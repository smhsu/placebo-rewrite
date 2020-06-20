import path = require("path");
import dotenv = require("dotenv");
import {setUpServer} from "../src/setUpServer";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {Server} from "@hapi/hapi";

export function createServer(client: MockMongoClient): Promise<Server> {
    dotenv.config({path: path.resolve(process.cwd(), ".env.test.local")});
    dotenv.config({path: path.resolve(process.cwd(), ".env.test")});
    dotenv.config(); // The plain .env file
    return setUpServer(client as any, {port: 9999, host: "localhost"});
}
