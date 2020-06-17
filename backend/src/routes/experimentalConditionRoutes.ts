import { Server } from "@hapi/hapi";
import { MongoClient } from "mongodb";
import * as ExperimentalConditionApi from "../common/getExperimentalConditionApi";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";
import { ConditionCountsProvider } from "../database/ConditionCountsProvider";

/**
 * Registers APIs that relate to generating random group assignments.
 * 
 * @param server
 * @author hhhenrysss
 */
export function registerRoutes(server: Server): void {
    if (!process.env.COUNT_COLLECTION_NAME || !process.env.DATABASE_NAME || !process.env.CONTROL_GROUP_PERCENTAGE) {
        throw new Error(
            "COUNT_COLLECTION_NAME, DATABASE_NAME, and CONTROL_GROUP_PERCENTAGE must be specified in the " + 
            "environment variables."
        );
    }

    const desiredControlPercentage = parseFloat(process.env.CONTROL_GROUP_PERCENTAGE);
    if (Number.isNaN(desiredControlPercentage)) {
        throw new Error("CONTROL_GROUP_PERCENTAGE environment variable must be a number.");
    } else if (desiredControlPercentage < 0 || desiredControlPercentage > 1) {
        throw new Error("CONTROL_GROUP_PERCENTAGE must within the range [0, 1].");
    }

    const conditionCountsProvider = new ConditionCountsProvider(
        server.app["mongoClient"] as MongoClient, process.env.DATABASE_NAME, process.env.COUNT_COLLECTION_NAME
    );

    server.route({
        method: ExperimentalConditionApi.METHOD,
        path: ExperimentalConditionApi.PATH,
        handler: async (request) => {
            let counts: Record<ExperimentalCondition, number>;
            try {
                counts = await conditionCountsProvider.getCounts();
            } catch (error) {
                counts = ConditionCountsProvider.makeZeroedCountDictionary();
                request.log("error", "Problem getting count of experimental condition assignments from database.  " +
                    "Participant will get a random assignment.");
                request.log("error", error);
            }

            let totalAssignments = 0;
            for (const count of Object.values(counts)) {
                totalAssignments += count;
            }

            let assignment: ExperimentalCondition;
            if (totalAssignments === 0) {
                if (Math.random() <= desiredControlPercentage) {
                    assignment = ExperimentalCondition.CONTROL;
                } else {
                    assignment = ExperimentalCondition.EXPERIMENTAL;
                }
            } else {
                const currentControlPercentage = counts[ExperimentalCondition.CONTROL] / totalAssignments;
                // Round-robin-like assignment
                if (currentControlPercentage < desiredControlPercentage) {
                    assignment = ExperimentalCondition.CONTROL;
                } else {
                    assignment = ExperimentalCondition.EXPERIMENTAL;
                }
            }

            try {
                await conditionCountsProvider.incrementCount(assignment);
            } catch (error) {
                request.log("Problem writing assigned experimental condition to database.");
                request.log("error", error);
            }
            
            const payload: ExperimentalConditionApi.ResponsePayload = { assignment };
            return payload;
        }
    });
}
