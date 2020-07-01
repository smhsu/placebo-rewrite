import {ExperimentalCondition} from "../../src/common/getExperimentalConditionApi";
import {Collection, Db, MongoClient, MongoError, Server} from "mongodb";
import {ObjectId} from "bson";

interface MockCollectionConfig {
    findOne: {
        throwError: boolean,
        notFind: boolean,
    };
    updateOne: {
        throwError: boolean,
        updatedValues: unknown | null
    };
    insertOne: {
        throwError: boolean,
        insertedValues: unknown | null
    };
    conditionCounts: Record<ExperimentalCondition, number>
}

class MockCollection implements Partial<Collection> {
    private _config: MockCollectionConfig;

    constructor(config: MockCollectionConfig) {
        this._config = config;
    }

    findOne = async () => {
        if (this._config.findOne.throwError) {
            throw new MongoError("findOne failed");
        }
        if (this._config.findOne.notFind) {
            return undefined;
        }
        return {
            ...this._config.conditionCounts,
            identifier: "mock doc",
        };
    }
    updateOne = async (...args) => {
        if (this._config.updateOne.throwError) {
            throw new MongoError("updateOne failed");
        }
        this._config.updateOne.updatedValues = args;
        return {
            result: { ok: 1, n: 1, nModified: 1 },
            connection: args,
            matchedCount: 1,
            modifiedCount: 1,
            upsertedCount: 1,
            upsertedId: { _id: new ObjectId(1) },
        };
    }
    insertOne = async (...args) => {
        if (this._config.insertOne.throwError) {
            throw new MongoError("insertOne failed");
        }
        this._config.insertOne.insertedValues = args;
        return {
            insertedCount: 1,
            ops: [],
            insertedId: new ObjectId(1),
            connection: args,
            result: { ok: 1, n: 1 },
        };
    }
}

interface MockDbConfig {
    collectionConfig: MockCollectionConfig,
    collection: {
        throwError: boolean
    }
}

export class MockDb extends Db {
    constructor(private config: MockDbConfig, ...args: ConstructorParameters<typeof Db>) {
        super(...args);
    }
    collection = (): Collection => {
        if (this.config.collection.throwError) {
            throw new Error("collection connection failed");
        }
        return new MockCollection(this.config.collectionConfig) as unknown as Collection;
    }
}

export class MockMongoClient extends MongoClient {
    config = {
        db: {
            throwError: false,
        },
        dbConfig: {
            collection: {
                throwError: false,
            },
            collectionConfig: {
                findOne: {
                    throwError: false,
                    notFind: false,
                },
                updateOne: {
                    throwError: false,
                    updatedValues: null
                },
                insertOne: {
                    throwError: false,
                    insertedValues: null
                },
                conditionCounts: {
                    [ExperimentalCondition.POPULARITY_SLIDER]: 30,
                    [ExperimentalCondition.RANDOMIZER_SETTING]: 70,
                }
            }
        }
    };
    constructor() {
        super("", undefined);
    }
    db = (): MockDb => {
        if (this.config.db.throwError) {
            throw new Error("db connection failed");
        }
        return new MockDb(
            this.config.dbConfig as MockDbConfig,
            "randomDbName",
            new Server("localhost", 10000),
            undefined
        );
    }
}
