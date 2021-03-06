import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { MongoClient, MongoError } from "mongodb";

import * as LogParticipantApi from "../common/logParticipantApi";
import { ParticipantLogProvider } from "../database/ParticipantLogProvider";

/**
 * Registers APIs that relate to storing data received from front-end.
 * @param server
 * @param makeParticipantLogProvider
 * @author hhhenrysss
 */
export default function registerRoutes(
    server: Server,
    makeParticipantLogProvider = ParticipantLogProvider.defaultFactory
): void {
    if (!(process.env.LOGS_COLLECTION_NAME && process.env.DATABASE_NAME)) {
        throw new Error("LOGS_COLLECTION_NAME and DATABASE_NAME must be specified in the environment variables.");
    }

    const client = server.app["mongoClient"] as MongoClient;
    const logProvider = makeParticipantLogProvider({
        client,
        dbName: process.env.DATABASE_NAME,
        collectionName: process.env.LOGS_COLLECTION_NAME,
    });

    server.route({
        method: LogParticipantApi.METHOD,
        path: LogParticipantApi.PATH,
        handler: async request => {
            if (!LogParticipantApi.isRequestPayload(request.payload)) {
                return Boom.badRequest();
            }

            try {
                await logProvider.storeLog(request.payload.data);
            } catch (error) {
                return new Boom.Boom(undefined, {
                    statusCode: error instanceof MongoError ? 502 : 500,
                    data: error
                });
            }

            return {};
        }
    });
}
