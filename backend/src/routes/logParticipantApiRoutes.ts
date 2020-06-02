import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { MongoClient } from "mongodb";

import * as StoreParticipantLogsApi from "../common/logParticipantApi";
import { dataCollection } from "../database/collections";

/**
 * Checks whether payload has the correct shape during runtime.
 * @param payload
 * @author hhhenrysss
 */
function isSubmissionRequest(payload: unknown): payload is StoreParticipantLogsApi.RequestPayload {
    if (!payload) {
        return false;
    }
    // assume that payload is JSON serializable
    if (typeof payload !== "object") {
        return false;
    }
    const keys = Object.keys(payload);
    return keys.length === 1 && keys[0] === "data";
}

/**
 * Registers APIs that relate to storing data received from front-end.
 * @param server
 * @author hhhenrysss
 */
export function registerRoutes(server: Server): void {
    if (!(process.env.DATA_COLLECTION_NAME && process.env.DATABASE_NAME)) {
        throw new Error("DATA_COLLECTION_NAME and DATABASE_NAME must be specified in the environment");
    }
    const client = server.app["mongoClient"] as MongoClient;
    const collection = dataCollection.getCollection(client);
    server.route({
        method: StoreParticipantLogsApi.METHOD,
        path: StoreParticipantLogsApi.PATH,
        handler: async (req) => {
            if (!isSubmissionRequest(req.payload)) {
                return Boom.badRequest("payload object can only have \"data\" as the only key");
            }
            const requestPayload = req.payload;
            const id = await dataCollection.storeData(collection, requestPayload.data);
            const result: StoreParticipantLogsApi.ResponsePayload = {
                mongoDBId: id
            };
            return result;
        }
    });
}
