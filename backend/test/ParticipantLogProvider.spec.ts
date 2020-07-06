import * as Lab from "@hapi/lab";
import sinon from "sinon";
import {expect} from "@hapi/code";
import {ParticipantLogProvider} from "../src/database/ParticipantLogProvider";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";
import { IParticipantLog } from "../src/common/logParticipantApi";

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
        mockMongoClient.modifyCollection({ insertOne: sinon.stub().rejects() });
        await expect(provider.storeLog({
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.INTERVAL,
            qualtricsID: ""
        })).to.reject();
    });

    it("should insert new records if no id", async () => {
        const insertOneStub = sinon.stub();
        mockMongoClient.modifyCollection({ insertOne: insertOneStub });
        const theLog: IParticipantLog = {
            didInteractWithSetting: false,
            experimentalCondition: ExperimentalCondition.RANDOM,
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
            experimentalCondition: ExperimentalCondition.RANDOM,
            qualtricsID: "10"
        };
        await provider.storeLog(theLog);
        sinon.assert.calledWithMatch(updateOneStub, {qualtricsID: "10"});
    });
});
