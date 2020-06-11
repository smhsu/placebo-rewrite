import { MongoClient, Collection } from "mongodb";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";

const COUNT_DOCUMENT_NAME = "counts";

type ConditionCounts = Record<ExperimentalCondition, number>;
interface CountSchema extends ConditionCounts {
    identifier: string;
}

export class ConditionCountsProvider {
    static makeZeroedCountDictionary(): ConditionCounts {
        const allZeros: Partial<ConditionCounts> = {};
        for (const condition of Object.values(ExperimentalCondition)) {
            allZeros[condition] = 0;
        }
        return allZeros as ConditionCounts;
    }

    private _collection: Collection<CountSchema>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection<CountSchema>(collectionName);
    }

    async getCounts(): Promise<ConditionCounts> {
        const document = await this._collection.findOne({identifier: COUNT_DOCUMENT_NAME});
        const counts = ConditionCountsProvider.makeZeroedCountDictionary();
        if (!document) {
            return counts;
        }

        // Merge in values from database to the zeroed counts, excluding the `identifier` property.
        delete document.identifier;
        return Object.assign(counts, document);
    }

    async incrementCount(condition: ExperimentalCondition): Promise<void> {
        const incrementAmount: Partial<ConditionCounts> = {
            [condition]: 1
        };
        await this._collection.updateOne({identifier: COUNT_DOCUMENT_NAME}, {$inc: incrementAmount}, {upsert: true});
    }
}
