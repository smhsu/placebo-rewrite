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
    if (
        !process.env.COUNT_COLLECTION_NAME ||
        !process.env.DATABASE_NAME ||
        !process.env.RANDOMIZER_SETTING_PROPORTION
    ) {
        throw new Error(
            "COUNT_COLLECTION_NAME, DATABASE_NAME, and RANDOMIZER_SETTING_PROPORTION must be specified in the " + 
            "environment variables."
        );
    }

    const desiredRandomSettingProportion = parseFloat(process.env.RANDOMIZER_SETTING_PROPORTION);
    if (Number.isNaN(desiredRandomSettingProportion)) {
        throw new Error("RANDOMIZER_SETTING_PROPORTION environment variable must be a number.");
    } else if (desiredRandomSettingProportion < 0 || desiredRandomSettingProportion > 1) {
        throw new Error("RANDOMIZER_SETTING_PROPORTION must within the range [0, 1].");
    }

    const conditionCountsProvider = new ConditionCountsProvider(
        server.app["mongoClient"] as MongoClient, process.env.DATABASE_NAME, process.env.COUNT_COLLECTION_NAME
    );

    server.route({
        method: ExperimentalConditionApi.METHOD,
        path: ExperimentalConditionApi.PATH,
        handler: async (request) => {
            let proportionWithRandomizerSetting: number;
            try {
                const counts = await conditionCountsProvider.getCounts();
                let totalAssignments = 0;
                for (const count of Object.values(counts)) {
                    totalAssignments += count;
                }
                proportionWithRandomizerSetting = counts[ExperimentalCondition.RANDOMIZER_SETTING] / totalAssignments;
            } catch (error) {
                request.log("error", "Problem getting count of experimental condition assignments from database.  " +
                    "Participant will get a random assignment.");
                request.log("error", error);
                proportionWithRandomizerSetting = Math.random();
            }

            const assignment = proportionWithRandomizerSetting < desiredRandomSettingProportion ?
                ExperimentalCondition.RANDOMIZER_SETTING : ExperimentalCondition.POPULARITY_SLIDER;

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
