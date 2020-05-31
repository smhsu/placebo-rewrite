import {Server} from "@hapi/hapi";
import {MongoClient} from "mongodb";
import * as RandomAssignment from "../common/src/requestRandomAssignmentApi";
import {GroupAssigment} from "../common/src/requestRandomAssignmentApi";
import {countCollection} from "../database/collections";

/**
 * Registers APIs that relate to generating random group assignments.
 * @param server
 * @author hhhenrysss
 */
export function registerRandomAssignment(server: Server): void {
    if (!(process.env.COUNT_COLLECTION_NAME && process.env.DATABASE_NAME)) {
        throw new Error("COUNT_COLLECTION_NAME and DATABASE_NAME must be specified in the environment variable");
    }
    const rawControlPercentage = process.env.CONTROL_GROUP_PERCENTAGE;
    let controlPercentage;
    if (rawControlPercentage != null) {
        const result = parseFloat(rawControlPercentage);
        if (Number.isNaN(result)) {
            throw new Error("Must input valid numeric number for CONTROL_GROUP_PERCENTAGE in the environment variable");
        }
        if (result < 0 || result > 1) {
            throw new Error("CONTROL_GROUP_PERCENTAGE must within the range [0, 1] in the environment variable");
        }
        controlPercentage = result;
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
            const incrementedTotal = totalCount + 1;
            const incrementedControl = payload.assignment === GroupAssigment.CONTROL ? controlGroupCount + 1 : controlGroupCount;
            await countCollection.storeCount(collection, [incrementedTotal, incrementedControl]);
            return payload;
        }
    });
}
