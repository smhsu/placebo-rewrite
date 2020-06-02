import { Server } from "@hapi/hapi";
import { registerRoutes as route0 } from "./twitterApiRoutes";
import { registerRoutes as route1 } from "./experimentalConditionRoutes";
import { registerRoutes as route2 } from "./logParticipantApiRoutes";

type RouteRegistrationFunction = (server: Server) => void

export function registerAllRoutes(server: Server): void {
    const registerFunctions: RouteRegistrationFunction[] = [
        route0,
        route1,
        route2
    ];

    for (const register of registerFunctions) {
        register(server);
    }
}
