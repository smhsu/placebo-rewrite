import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {ConditionCountsProvider} from "../src/database/ConditionCountsProvider";
import {ExperimentalCondition} from "../src/common/getExperimentalConditionApi";
import {MockMongoClient} from "./mockObjects/MockMongoClient";

const { describe, it, beforeEach } = exports.lab = Lab.script();

const dbName = "random db name";
const collectionName = "random collection name";

describe("ConditionCountsProvider testing -> ", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ConditionCountsProvider;
    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = new ConditionCountsProvider(mockMongoClient as any, dbName, collectionName);
    });
    it("should propagate getCounts promise rejection", async () => {
        mockMongoClient.config.collectionConfig.findOne.throwError = true;
        await expect(provider.getCounts()).to.reject();
    });
    it("should create empty counts object", () => {
        const result = ConditionCountsProvider.makeZeroedCountDictionary();
        const conditionValues = Object.values(ExperimentalCondition);
        expect(Object.keys(result).length).to.equal(conditionValues.length);
        for (const key of conditionValues) {
            expect(result[key]).to.equal(0);
        }
    });
    it("should get empty counts when no records found", async () => {
        mockMongoClient.config.collectionConfig.findOne.notFind = true;
        const result = await provider.getCounts();
        expect(result[ExperimentalCondition.POPULARITY_SLIDER]).to.equal(0);
        expect(result[ExperimentalCondition.RANDOMIZER_SETTING]).to.equal(0);
        expect(result["identifier"]).to.be.undefined();
    });
    it("should get correct counts without identifier", async () => {
        mockMongoClient.config.collectionConfig.conditionCounts.popularity_slider = 10;
        mockMongoClient.config.collectionConfig.conditionCounts.random_setting = 20;
        const result = await provider.getCounts();
        expect(result[ExperimentalCondition.POPULARITY_SLIDER]).to.equal(10);
        expect(result[ExperimentalCondition.RANDOMIZER_SETTING]).to.equal(20);
        expect(result["identifier"]).to.be.undefined();
    });
    it("should propagate incrementCount promise rejection", async () => {
        // incrementCount cannot be fully tested without connecting to an actual db
        mockMongoClient.config.collectionConfig.updateOne.throwError = true;
        await expect(provider.incrementCount(ExperimentalCondition.RANDOMIZER_SETTING)).to.reject();
    });
});
