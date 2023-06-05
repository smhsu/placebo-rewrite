import { Server, ServerOptions } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Boom from "@hapi/boom";
import { MongoClient } from "mongodb";
import experimentalConditionRoutes from "./routes/experimentalConditionRoutes";
import logParticipantApiRoutes from "./routes/logParticipantApiRoutes";
import publicRoute from "./routes/publicRoute";
import twitterApiRoutes from "./routes/twitterApiRoutes";

function registerAllRoutes(server: Server) {
    [
        experimentalConditionRoutes,
        logParticipantApiRoutes,
        publicRoute,
        twitterApiRoutes,
    ].forEach(route => route(server));
}

/**
 * Sets up a Hapi server, all configured and ready to go.  The only thing left to do is to start it.  For Hapi config
 * options, see https://hapijs.com/api#server.options
 *
 * @param mongoClient - MongoDB connection
 * @param options - Hapi server configuration object
 * @return Hapi server
 */
export async function setUpServer(mongoClient: MongoClient, options: ServerOptions): Promise<Server> {
    const server = new Server(options);
    server.app["mongoClient"] = mongoClient;
    await server.register(Inert);
    registerAllRoutes(server);

    // Runs every time somebody calls request.log() or Boom is used to return a status code >= 400.
    server.events.on("request", (request, event, tags) => {
        if (tags.error) {
            const theError = event.error as Error;
            if (Boom.isBoom(theError)) {
                if (theError.output.statusCode >= 500) {
                    console.error(`${request.path}: returned HTTP ${theError.output.statusCode}`);
                    console.error(JSON.stringify(theError.data));
                }
            } else {
                console.error(`${request.path}: uncaught error`);
                console.error(event.error || event.data);
            }
        }
    });

    return server;
}
