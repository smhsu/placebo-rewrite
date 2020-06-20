import { Collection, MongoClient } from "mongodb";
import { IParticipantLog } from "../common/logParticipantApi";

export class ParticipantLogProvider {
    private _collection: Collection<IParticipantLog>;

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this._collection = client.db(dbName).collection(collectionName);
    }

    async storeLog(data: IParticipantLog): Promise<void> {
        if (data.qualtricsID) { // implicitly qualtricsID && qualtricsID.length > 0
            await this._collection.updateOne(
                { qualtricsID: data.qualtricsID }, { $set: data }, { upsert: true }
            );
        } else { // Store as separate records if no qualtrics ID
            await this._collection.insertOne(data);
        }
    }
}
