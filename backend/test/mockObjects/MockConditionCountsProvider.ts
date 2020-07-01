import {ConditionCounts, ConditionCountsProvider} from "../../src/database/ConditionCountsProvider";
import {ExperimentalCondition} from "../../src/common/getExperimentalConditionApi";

export class MockConditionCountsProvider extends ConditionCountsProvider{
    config = {
        getCounts: {
            throwError: false,
            counts: new Map<ExperimentalCondition, number>(),
        },
        incrementCount: {
            throwError: false,
            incrementIntention: null as null | ExperimentalCondition,
        }
    }
    constructor(...args: ConstructorParameters<typeof ConditionCountsProvider>) {
        super(...args);
    }
    getCounts = async (): Promise<ConditionCounts> => {
        if (this.config.getCounts.throwError) {
            throw new Error("getCounts error");
        }
        return Array.from(this.config.getCounts.counts).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {} as ConditionCounts);
    }
    incrementCount = async (condition: ExperimentalCondition): Promise<void> => {
        if (this.config.incrementCount.throwError) {
            throw new Error("getCounts error");
        }
        this.config.incrementCount.incrementIntention = condition;
    }
}
