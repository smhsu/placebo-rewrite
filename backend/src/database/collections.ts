import {Collection, MongoClient} from "mongodb";

/**
 * Convenience methods related to manipulating the data collection
 */
export const dataCollection = {
    getCollection(client: MongoClient): Collection<unknown> {
        return client.db(process.env.DATABASE_NAME).collection(process.env.DATA_COLLECTION_NAME);
    },
    async storeData(collection: Collection<unknown>, data: unknown): Promise<string> {
        const result = await collection.insertOne(data);
        if (!result.insertedId) {
            throw new Error("Fail to insert document");
        }
        const insertedId = `${result.insertedId}`;
        return insertedId;
    }
};

const COUNT_DOC_ID = "group_count";

export interface CountSchema {
    totalCount: number;
    controlGroupCount: number;
    identifier: string;
}

/**
 * Convenience methods related to manipulating the count collection
 */
export const countCollection = {
    getCollection(client: MongoClient): Collection<CountSchema> {
        return client.db(process.env.DATABASE_NAME).collection(process.env.COUNT_COLLECTION_NAME);
    },
    async getCounts(collection: Collection<CountSchema>): Promise<[number, number]> {
        const doc = await collection.findOne({identifier: COUNT_DOC_ID});
        if (!doc) {
            return [0, 0];
        }
        return [doc.totalCount, doc.controlGroupCount];
    },
    async storeCount(collection: Collection<CountSchema>, [totalCount, controlGroupCount]: [number, number]): Promise<void> {
        const newDoc: CountSchema = {
            totalCount, controlGroupCount, identifier: COUNT_DOC_ID
        };
        await collection.updateOne({identifier: COUNT_DOC_ID}, newDoc, {upsert: true});
    }
};
