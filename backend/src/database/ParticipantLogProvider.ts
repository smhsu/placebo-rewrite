import { Collection } from "mongodb";
import { IParticipantLog } from "../common/logParticipantApi";
import {CollectionConfig} from "./ConditionCountsProvider";

export class ParticipantLogProvider {

    static defaultFactory(config: CollectionConfig): ParticipantLogProvider {
        return new ParticipantLogProvider().withMongoConfig(config);
    }

    private _collection: Collection<IParticipantLog>;

    withMongoConfig({ client, dbName, collectionName }: CollectionConfig): this {
        this._collection = client.db(dbName).collection(collectionName);
        return this;
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
