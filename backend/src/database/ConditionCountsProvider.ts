import { MongoClient, Collection } from "mongodb";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";

/** Identifier of the one document we plan to store. */
const COUNT_DOCUMENT_NAME = "counts";

/**
 * Mapping from experimental condition to the number of participants assigned to that condition.
 */
export type ConditionCounts = Record<ExperimentalCondition, number>;

/**
 * Database schema for storing counts of participants assigned to each experimental condition.
 */
interface CountSchema extends Partial<ConditionCounts> {
    /** Identifier of the one document we plan to store. */
    identifier: string;
}


/**
 * Factory function to create ConditionCountsProvider
 */
export type ConditionCountsProviderFactory = (
    ...args: ConstructorParameters<typeof ConditionCountsProvider>
) => ConditionCountsProvider;

/**
 * Default factory function to create ConditionCountsProvider
 * @param args
 */
export function defaultConditionCountsProviderFactory(
    ...args: Parameters<ConditionCountsProviderFactory>
): ConditionCountsProvider {
    return new ConditionCountsProvider(...args);
}
/**
 * Provides a high-level API for accessing the counts of how many participants have been assigned to experimental 
 * conditions.
 * 
 * @author Silas Hsu
 */
export class ConditionCountsProvider {

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
        let document: Partial<ConditionCounts> | null =
            await this._collection.findOne({identifier: COUNT_DOCUMENT_NAME});
        if (!document) {
            document = {};
        }

        // Select the relevant values from the document
        const counts: Partial<ConditionCounts> = {};
        for (const condition of Object.values(ExperimentalCondition)) {
            counts[condition] = document[condition] || 0;
        }

        return counts as ConditionCounts;
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
