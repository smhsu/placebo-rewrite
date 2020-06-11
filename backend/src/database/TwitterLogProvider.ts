import { Collection, MongoClient } from "mongodb";

export class TwitterLogProvider {
    _collection: Collection<unknown>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection(collectionName);
    }

    async storeLog(data: unknown): Promise<string> {
        const insertResult = await this._collection.insertOne(data);
        return insertResult.insertedId.toHexString();
    }
}
