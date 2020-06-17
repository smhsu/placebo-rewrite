import {setUpServer} from "../src/setUpServer";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {Server} from "@hapi/hapi";

export function createServer(client: MockMongoClient): Promise<Server> {
    process.env.DATABASE_NAME = "anything";
    process.env.DATA_COLLECTION_NAME = "anything";
    process.env.COUNT_COLLECTION_NAME = "anything";
    process.env.CALLBACK_URL = "http://localhost";
    process.env.CONSUMER_KEY = "CONSUMER_KEY";
    process.env.CONSUMER_SECRET = "CONSUMER_SECRET";
    process.env.MONGODB_URI = "mongodb://localhost";
    return setUpServer(client as any, {port: 9999, host: "localhost"});
}
