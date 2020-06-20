import {ExperimentalCondition} from "../../src/common/getExperimentalConditionApi";
import {MongoError} from "mongodb";

interface MockCollectionConfig {
    findOne: {
        throwError: boolean,
        notFind: boolean,
    };
    updateOne: {
        throwError: boolean,
    };
    insertOne: {
        throwError: boolean,
    };
    conditionCounts: Record<ExperimentalCondition, number> & { controlGroupPercentage: number }
}

class MockCollection {
    private _config: MockCollectionConfig;

    constructor(config: MockCollectionConfig) {
        this._config = config;
        process.env.CONTROL_GROUP_PERCENTAGE = config.conditionCounts.controlGroupPercentage.toString();
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
        return args;
    }
    insertOne = async () => {
        if (this._config.insertOne.throwError) {
            throw new MongoError("insertOne failed");
        }
    }
}

export class MockMongoClient {
    config = {
        db: {
            throwError: false,
        },
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
            },
            insertOne: {
                throwError: false,
            },
            conditionCounts: {
                [ExperimentalCondition.POPULARITY_SLIDER]: 30,
                [ExperimentalCondition.RANDOMIZER_SETTING]: 70,
                controlGroupPercentage: 0.3
            }
        }
    };
    db: () => { collection: () => MockCollection } = () => {
        if (this.config.db.throwError) {
            throw new Error("db connection failed");
        }
        return {
            collection: (): MockCollection => {
                if (this.config.collection.throwError) {
                    throw new Error("collection connection failed");
                }
                return new MockCollection(this.config.collectionConfig);
            }
        };
    }
}
