import { Collection, MongoClient } from "mongodb";

export class TwitterLogProvider {
    _collection: Collection<unknown>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection(collectionName);
    }

    async storeLog(data: unknown): Promise<string> {
        const result = await this._collection.insertOne(data);
        if (!result.insertedId) {
            throw new Error("Failed to insert document");
        }
        return `${result.insertedId}`;
    }
}
