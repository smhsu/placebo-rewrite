import {Collection, MongoClient} from "mongodb";

export class TwitterLogProvider {
    #collection: Collection<unknown>
    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this.#collection = client.db(dbName).collection(collectionName);
    }
    async storeLog(data: unknown): Promise<string> {
        const result = await this.#collection.insertOne(data);
        if (!result.insertedId) {
            throw new Error("Failed to insert document");
        }
        return `${result.insertedId}`;
    }
}
