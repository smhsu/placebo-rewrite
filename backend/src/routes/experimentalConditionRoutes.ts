import { Server } from "@hapi/hapi";
import { sum, maxBy } from "lodash";
import * as ExperimentalConditionApi from "../common/getExperimentalConditionApi";
import { ExperimentalCondition, DesiredProportions, getRandomCondition } from "../common/ExperimentalCondition";
import { ConditionCountsProvider, ConditionCounts } from "../database/ConditionCountsProvider";

/**
 * Registers APIs that relate to generating random group assignments.
 *
 * @param server - the Server object to register the routes with
 * @param makeConditionCountsProvider - factory function that returns a database connection
 * @param desiredConditionProportions - desired proportion of experiment conditions to return from the API.
 * @author hhhenrysss
 */
export default function registerRoutes(
    server: Server,
    makeConditionCountsProvider = ConditionCountsProvider.defaultFactory,
    desiredConditionProportions = DesiredProportions
): void {
    if (!process.env.COUNT_COLLECTION_NAME || !process.env.DATABASE_NAME) {
        throw new Error("COUNT_COLLECTION_NAME and RANDOMIZER_SETTING_PROPORTION must be specified in the " +
            "environment variables.");
    }
    if (sum(Object.values(desiredConditionProportions)) != 1) {
        throw new Error("Desired experiment condition proportions must sum to 1.");
    }

    const conditionCountsProvider = makeConditionCountsProvider({
        client: server.app["mongoClient"],
        dbName: process.env.DATABASE_NAME,
        collectionName: process.env.COUNT_COLLECTION_NAME
    });

    server.route({
        method: ExperimentalConditionApi.METHOD,
        path: ExperimentalConditionApi.PATH,
        handler: async (request) => {
            let counts: ConditionCounts | null = null;
            try {
                counts = await conditionCountsProvider.getCounts();
            } catch (error) {
                request.log("error", "Problem getting count of experimental condition assignments from database.  " +
                    "Participant will get a random assignment.");
                request.log("error", error);
            }

            const assignment = counts ?
                assignLeastSatisfiedCondition(counts, desiredConditionProportions) : getRandomCondition();
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

function assignLeastSatisfiedCondition(
    counts: ConditionCounts,
    desiredProportions: Record<ExperimentalCondition, number>
): ExperimentalCondition {
    const totalAssignments = sum(Object.values(counts));
    const differencesFromDesired: [ExperimentalCondition, number][] = Object.entries(counts).map(([condition, count]) =>
        [condition as ExperimentalCondition, desiredProportions[condition] - (count / totalAssignments)]
    );
    const largestDifferencePair = maxBy(differencesFromDesired, 1);
    return largestDifferencePair ? largestDifferencePair[0] : getRandomCondition();
}
