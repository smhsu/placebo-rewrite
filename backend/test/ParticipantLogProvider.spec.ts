import * as Lab from "@hapi/lab";
import * as sinon from "sinon";
import { expect } from "@hapi/code";

import { MockMongoClient } from "./mockObjects/MockMongoClient";
import { ParticipantLogProvider } from "../src/database/ParticipantLogProvider";
import { ExperimentalCondition } from "../src/common/ExperimentalCondition";
import { IParticipantLog } from "../src/common/logParticipantApi";

const { describe, it, beforeEach } = exports.lab = Lab.script();

describe("ParticipantLogProvider testing ->", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ParticipantLogProvider;

    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = ParticipantLogProvider.defaultFactory({
            client: mockMongoClient,
            dbName: "random db name",
            collectionName: "random collection name"
        });
    });

    it("should propagate storeLog promise rejection", async () => {
        mockMongoClient.modifyCollection({ insertOne: sinon.stub().rejects() });
        await expect(provider.storeLog({
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.POPULARITY_SLIDER,
            qualtricsID: ""
        })).to.reject();
    });

    it("should insert new records if no id", async () => {
        const insertOneStub = sinon.stub();
        mockMongoClient.modifyCollection({ insertOne: insertOneStub });
        const theLog: IParticipantLog = {
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.NO_SETTING,
            qualtricsID: ""
        };
        await provider.storeLog(theLog);
        sinon.assert.calledWithMatch(insertOneStub, theLog);
    });

    it("should update existing records if id exists", async () => {
        const updateOneStub = sinon.stub();
        mockMongoClient.modifyCollection({ updateOne: updateOneStub });
        const theLog: IParticipantLog = {
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.NO_SETTING,
            qualtricsID: "10"
        };
        await provider.storeLog(theLog);
        sinon.assert.calledWithMatch(updateOneStub, {qualtricsID: "10"});
    });
});
