import {Server} from "@hapi/hapi";
import {MongoClient} from "mongodb";
import * as RandomAssignment from "../../../common/src/requestRandomAssignmentApi";
import {GroupAssigment} from "../../../common/src/requestRandomAssignmentApi";
import {guardEnv} from "../utils/env";
import {userConnection} from "../database/user";

// TODO: add a eslint config file

function getControl() {
    return {
        assignment: GroupAssigment.CONTROL
    } as RandomAssignment.ResponsePayload;
}
function getExperimental() {
    return {
        assignment: GroupAssigment.EXPERIMENTAL
    } as RandomAssignment.ResponsePayload;
}

// TODO: Use jsdoc
/**
 * Assumptions:
 *  * The database doesn't have count for all user records
 *  * In each document there is a field called GROUP_FIELD_NAME
 *  * The timeout operation is handled by other methods, i.e. TTL indexes
 * @param server
 */
export function registerRandomAssignment(server: Server) {
    guardEnv.databaseConnection();
    guardEnv.groupPercentage();
    const client = server.app['mongoClient'] as MongoClient;
    const controlPercentage = parseFloat(process.env.CONTROL_GROUP_PERCENTAGE);
    const userCollection = userConnection.getCollection(client);
    server.route({
        method: RandomAssignment.METHOD,
        path: RandomAssignment.PATH,
        handler: async () => {
            const {total: totalCount, controlGroup: controlGroupCount} = await userConnection.getCounts(userCollection);
            // FIXME: use let; remove getControl/getExperimental
            if (totalCount === 0) {
                if (Math.random() <= controlPercentage) {
                    return getControl();
                } else {
                    return getExperimental();
                }
            }
            const storedControlPercentage = controlGroupCount/totalCount;
            // round robin-like assignment
            if (storedControlPercentage < controlPercentage) {
                return getControl();
            } else {
                return getExperimental();
            }
        }
    });
}

// TODO: server stores counts into a new collection; when users request increments the count;