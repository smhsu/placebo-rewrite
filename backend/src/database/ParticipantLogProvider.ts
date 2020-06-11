import { Collection, MongoClient } from "mongodb";

export class ParticipantLogProvider {
    _collection: Collection<Record<string, unknown>>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection(collectionName);
    }

    async storeLog(data: Record<string, unknown>): Promise<string> {
        const insertResult = await this._collection.insertOne(data);
        return insertResult.insertedId.toHexString();
    }
}
