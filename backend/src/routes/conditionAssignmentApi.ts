import { Server } from "@hapi/hapi";
import { MongoClient } from "mongodb";
import * as RandomAssignment from "../common/requestRandomAssignmentApi";
import { GroupAssigment } from "../common/requestRandomAssignmentApi";
import { countCollection } from "../database/collections";

/**
 * Registers APIs that relate to generating random group assignments.
 * @param server
 * @author hhhenrysss
 */
export function registerRandomAssignment(server: Server): void {
    if (!process.env.COUNT_COLLECTION_NAME || !process.env.DATABASE_NAME || !process.env.CONTROL_GROUP_PERCENTAGE) {
        throw new Error(
            "COUNT_COLLECTION_NAME, DATABASE_NAME, and CONTROL_GROUP_PERCENTAGE must be specified in the " + 
            "environment variables."
        );
    }

    const controlPercentage = parseFloat(process.env.CONTROL_GROUP_PERCENTAGE);
    if (Number.isNaN(controlPercentage)) {
        throw new Error("CONTROL_GROUP_PERCENTAGE environment variable must be a number.");
    } else if (controlPercentage < 0 || controlPercentage > 1) {
        throw new Error("CONTROL_GROUP_PERCENTAGE must within the range [0, 1].");
    }
    const client = server.app["mongoClient"] as MongoClient;
    const collection = countCollection.getCollection(client);

    server.route({
        method: RandomAssignment.METHOD,
        path: RandomAssignment.PATH,
        handler: async () => {
            const payload: RandomAssignment.ResponsePayload = {
                assignment: GroupAssigment.EXPERIMENTAL
            };

            const [totalCount, controlGroupCount] = await countCollection.getCounts(collection);
            if (totalCount === 0) {
                if (Math.random() <= controlPercentage) {
                    payload.assignment = GroupAssigment.CONTROL;
                }
            } else {
                const storedControlPercentage = controlGroupCount / totalCount;
                // round robin-like assignment
                if (storedControlPercentage < controlPercentage) {
                    payload.assignment = GroupAssigment.CONTROL;
                }
            }

            await countCollection.incrementCount(collection, payload.assignment);
            return payload;
        }
    });
}
