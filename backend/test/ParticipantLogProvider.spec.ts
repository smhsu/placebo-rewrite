import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {ParticipantLogProvider} from "../src/database/ParticipantLogProvider";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";

const { describe, it, beforeEach } = exports.lab = Lab.script();

const dbName = "random db name";
const collectionName = "random collection name";

describe("ParticipantLogProvider testing ->", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ParticipantLogProvider;

    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = new ParticipantLogProvider(mockMongoClient, dbName, collectionName);
    });

    it("should propagate storeLog promise rejection", async () => {
        mockMongoClient.config.dbConfig.collectionConfig.insertOne.throwError = true;
        await expect(provider.storeLog({
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.INTERVAL,
            qualtricsID: ""
        })).to.reject();
    });

    it("should insert new records if no id", async () => {
        await provider.storeLog({
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.RANDOM,
            qualtricsID: ""
        });
        expect(
            mockMongoClient.config.dbConfig.collectionConfig.insertOne.insertedValues[0].experimentalCondition
        ).to.equal(ExperimentalCondition.RANDOM);
    });

    it("should update existing records if id exists", async () => {
        await provider.storeLog({
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.RANDOM,
            qualtricsID: "10"
        });
        expect(mockMongoClient.config.dbConfig.collectionConfig.updateOne.updatedValues[0].qualtricsID).to.equal("10");
    });
});
