import { MongoClient, Collection } from "mongodb";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";

/** Identifier of the one document we plan to store. */
const COUNT_DOCUMENT_NAME = "counts";

/**
 * Mapping from experimental condition to the number of participants assigned to that condition.
 */
type ConditionCounts = Record<ExperimentalCondition, number>;

/**
 * Database schema for storing counts of participants assigned to each experimental condition.
 */
interface CountSchema extends ConditionCounts {
    /** Identifier of the one document we plan to store. */
    identifier: string;
}

/**
 * Provides a high-level API for accessing the counts of how many participants have been assigned to experimental 
 * conditions.
 * 
 * @author Silas Hsu
 */
export class ConditionCountsProvider {
    /**
     * @return all experimental conditions mapped to the number 0
     */
    static makeZeroedCountDictionary(): ConditionCounts {
        const allZeros: Partial<ConditionCounts> = {};
        for (const condition of Object.values(ExperimentalCondition)) {
            allZeros[condition] = 0;
        }
        return allZeros as ConditionCounts;
    }

    private _collection: Collection<CountSchema>;

    /**
     * Makes a new instance.
     * 
     * @param client - database connection
     * @param dbName - name of the database to read/write from
     * @param collectionName - collection to read/write from
     */
    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection<CountSchema>(collectionName);
    }

    /**
     * Reads the database to get a mapping from each experimental condition to the number of participants assigned to
     * that condition.
     * 
     * @return a promise for the number of participants assigned to each experimental condition.
     */
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

    /**
     * Increases the count of participants assigned to a condition by one.
     * 
     * @param condition - the experimental condition to increment
     * @return promise that resolves when the operation is completed
     */
    async incrementCount(condition: ExperimentalCondition): Promise<void> {
        const incrementAmount: Partial<ConditionCounts> = {
            [condition]: 1
        };
        await this._collection.updateOne({identifier: COUNT_DOCUMENT_NAME}, {$inc: incrementAmount}, {upsert: true});
    }
}
