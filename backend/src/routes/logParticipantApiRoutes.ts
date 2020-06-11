import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { MongoClient } from "mongodb";

import * as StoreParticipantLogsApi from "../common/logParticipantApi";
import { ParticipantLogProvider } from "../database/ParticipantLogProvider";

/**
 * Registers APIs that relate to storing data received from front-end.
 * @param server
 * @author hhhenrysss
 */
export function registerRoutes(server: Server): void {
    if (!(process.env.DATA_COLLECTION_NAME && process.env.DATABASE_NAME)) {
        throw new Error("DATA_COLLECTION_NAME and DATABASE_NAME must be specified in the environment variables.");
    }

    const client = server.app["mongoClient"] as MongoClient;
    const logProvider = new ParticipantLogProvider(client, process.env.DATA_COLLECTION_NAME, process.env.DATABASE_NAME);

    server.route({
        method: StoreParticipantLogsApi.METHOD,
        path: StoreParticipantLogsApi.PATH,
        handler: async (req) => {
            if (!StoreParticipantLogsApi.isRequestPayload(req.payload)) {
                return Boom.badRequest();
            }

            await logProvider.storeLog(req.payload.data);
            return {};
        }
    });
}
