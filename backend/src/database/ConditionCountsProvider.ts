import { MongoClient, Collection } from "mongodb";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";

const COUNT_DOCUMENT_NAME = "counts";

interface DatabaseCounts {
    experimentalGroupCount: number;
    controlGroupCount: number;
}

interface CountSchema extends Partial<DatabaseCounts> {
    identifier: string;
}

const dbKeyForCondition: Record<ExperimentalCondition, keyof DatabaseCounts> = {
    [ExperimentalCondition.CONTROL]: "controlGroupCount",
    [ExperimentalCondition.EXPERIMENTAL]: "experimentalGroupCount"
};

type ConditionCounts = Record<ExperimentalCondition, number>;

export class ConditionCountsProvider {
    static makeZeroedCountDictionary(): ConditionCounts {
        const allZeros: Partial<ConditionCounts> = {};
        for (const condition in ExperimentalCondition) {
            allZeros[condition] = 0;
        }
        return allZeros as ConditionCounts;
    }

    private _collection: Collection<CountSchema>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection<CountSchema>(collectionName);
    }

    async getCounts(): Promise<ConditionCounts> {
        const document: CountSchema = await this._collection.findOne({identifier: COUNT_DOCUMENT_NAME});
        const result = ConditionCountsProvider.makeZeroedCountDictionary();
        if (!document) {
            return result;
        }

        for (const [condition, dbKey] of Object.entries(dbKeyForCondition)) {
            result[condition] = document[dbKey]; // Merge in values from database to the zeroed counts. 
        }
        return result;
    }

    async incrementCount(condition: ExperimentalCondition): Promise<void> {
        const incrementAmount: Partial<DatabaseCounts> = {
            [dbKeyForCondition[condition]]: 1
        };
        await this._collection.updateOne({identifier: COUNT_DOCUMENT_NAME}, {$inc: incrementAmount}, {upsert: true});
    }
}
