import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {ConditionCountsProvider} from "../src/database/ConditionCountsProvider";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";
import {MockMongoClient} from "./mockObjects/MockMongoClient";

const { describe, it, beforeEach } = exports.lab = Lab.script();

const dbName = "random db name";
const collectionName = "random collection name";

describe("ConditionCountsProvider testing -> ", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ConditionCountsProvider;

    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = new ConditionCountsProvider(mockMongoClient, dbName, collectionName);
    });

    it("should propagate getCounts promise rejection", async () => {
        mockMongoClient.config.dbConfig.collectionConfig.findOne.throwError = true;
        await expect(provider.getCounts()).to.reject();
    });

    it("should get empty counts when no records found", async () => {
        mockMongoClient.config.dbConfig.collectionConfig.findOne.notFind = true;
        const result = await provider.getCounts();
        for (const val of Object.values(ExperimentalCondition)) {
            expect(result[val]).to.equal(0);
        }
    });

    it("should get correct counts without any other keys", async () => {
        const counts = Object.values(ExperimentalCondition).reduce((acc, curr) => {
            acc[curr] = Math.floor(Math.random() * 100);
            return acc;
        }, {} as Record<ExperimentalCondition, number>);
        mockMongoClient.config.dbConfig.collectionConfig.conditionCounts = counts;
        const result = await provider.getCounts();
        const allKeys = new Set(Object.keys(result));
        for (const val of Object.values(ExperimentalCondition)) {
            expect(result[val]).to.equal(counts[val]);
            allKeys.delete(val);
        }
        expect(allKeys.size).to.equal(0);
    });

    it("should propagate incrementCount promise rejection", async () => {
        // incrementCount cannot be fully tested without connecting to an actual db
        mockMongoClient.config.dbConfig.collectionConfig.updateOne.throwError = true;
        await expect(provider.incrementCount(ExperimentalCondition.RANDOMIZER_SETTING)).to.reject();
    });
});
