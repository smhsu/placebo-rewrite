import { Server } from "@hapi/hapi";
import { registerRoutes as register0 } from "./twitterApiRoutes";
import { registerRoutes as register1 } from "./experimentalConditionRoutes";
import { registerRoutes as register2 } from "./logParticipantApiRoutes";
import { registerRoutes as register3 } from "./publicRoute";

type RouteRegistrationFunction = (server: Server) => void

export function registerAllRoutes(server: Server): void {
    const registerFunctions: RouteRegistrationFunction[] = [
        register0,
        register1,
        register2,
        register3
    ];

    for (const register of registerFunctions) {
        register(server);
    }
}
