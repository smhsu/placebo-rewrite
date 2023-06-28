import { Collection } from "mongodb";
import { IParticipantLog } from "../common/logParticipantApi";
import { CollectionConfig } from "./ConditionCountsProvider";

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
        await this._collection.insertOne(data);
    }
}
