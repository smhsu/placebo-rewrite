import { Server, ServerOptions } from "@hapi/hapi";
import * as Inert from "@hapi/inert";
import { MongoClient } from "mongodb";
import { registerTwitterRoutes } from "./routes/twitterAuth";

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

    server.events.on("request", (request, event, tags) => {
        if (tags.error) {
            const message = event.error instanceof Error ? event.error.message : "unknown";
            console.error(`[ERROR] In ${request.path}: ${message}`);
        }
    });
    
    return server;
}
