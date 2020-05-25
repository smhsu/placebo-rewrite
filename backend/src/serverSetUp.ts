import { Server, ServerOptions } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Boom from "@hapi/boom";
import { MongoClient } from "mongodb";
import { registerTwitterRoutes } from "./routes/twitterApi";
import { registerRandomAssignment } from "./routes/randomGroup";

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
    registerTwitterRoutes(server);
    registerRandomAssignment(server);

    // Runs every time somebody calls request.log() or Boom is used to return a status code >= 400.
    server.events.on("request", (request, event, tags) => {
        if (tags.error) {
            if (event.error && (event.error as any).isBoom) {
                const theError = event.error as Boom.Boom<any>;
                if (theError.output.statusCode >= 500) {
                    const reason = typeof theError.data.toString === "function" ?
                        theError.data.toString() : "(unknown)";
                    console.error(`HTTP ${theError.output.statusCode} from ${request.path} caused by ${reason}`);
                }
            } else {
                console.error(`Error from ${request.path}`);
                console.error(event.error);
            }
        }
    });

    return server;
}
