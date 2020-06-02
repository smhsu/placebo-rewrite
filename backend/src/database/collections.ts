import { Collection, MongoClient } from "mongodb";

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
            throw new Error("Failed to insert document");
        }
        const insertedId = `${result.insertedId}`;
        return insertedId;
    }
};
