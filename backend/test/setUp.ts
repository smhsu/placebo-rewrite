import {setUpServer} from "../src/setUpServer";
import {MockMongoClient} from "./mockObjects/MockMongoClient";

export function createServer(client: MockMongoClient) {
    return setUpServer(client as any, {port: 9999, host: 'localhost'});
}
