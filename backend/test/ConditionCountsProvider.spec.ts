import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { stub } from "sinon";
import { ConditionCountsProvider, ConditionCounts } from "../src/database/ConditionCountsProvider";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";
import { MockMongoClient } from "./mockObjects/MockMongoClient";

const { describe, it, beforeEach } = exports.lab = Lab.script();

describe("ConditionCountsProvider testing -> ", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ConditionCountsProvider;

    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = ConditionCountsProvider.defaultFactory({
            client: mockMongoClient,
            dbName: "random db name",
            collectionName: "random collection name"
        });
    });

    it("should propagate getCounts promise rejection", async () => {
        mockMongoClient.modifyCollection({ findOne: stub().rejects() });
        expect(provider.getCounts()).to.reject();
    });

    it("should get empty counts when no records found", async () => {
        mockMongoClient.modifyCollection({ findOne: stub().resolves(null) });
        const result = await provider.getCounts();
        for (const val of Object.values(ExperimentalCondition)) {
            expect(result[val]).to.equal(0);
        }
    });

    it("should get correct counts even when not all counts are in the database", async () => {
        const dbCounts: Partial<ConditionCounts> = {
            [ExperimentalCondition.RANDOM]: 3,
            [ExperimentalCondition.INTERVAL]: 5
        };
        mockMongoClient.modifyCollection({ findOne: stub().resolves(dbCounts) });
        const result = await provider.getCounts();

        expect(Object.keys(result)).to.have.length(Object.values(ExperimentalCondition).length);
        for (const condition of Object.values(ExperimentalCondition)) {
            if (condition in dbCounts) {
                expect(result[condition]).to.equal(dbCounts[condition]);
            } else {
                expect(result[condition]).to.equal(0);
            }
        }
    });

    // TODO should get correct counts if database has extraneous keys

    it("should propagate incrementCount promise rejection", async () => {
        // incrementCount cannot be fully tested without connecting to an actual db
        mockMongoClient.modifyCollection({ updateOne: stub().rejects() });
        expect(provider.incrementCount(ExperimentalCondition.RANDOMIZER_SETTING)).to.reject();
    });
});
