import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {ParticipantLogProvider} from "../src/database/ParticipantLogProvider";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
const { describe, it, beforeEach } = exports.lab = Lab.script();

const dbName = "random db name";
const collectionName = "random collection name";

describe("ParticipantLogProvider testing ->", () => {
    let mockMongoClient: MockMongoClient;
    let provider: ParticipantLogProvider;
    beforeEach(() => {
        mockMongoClient = new MockMongoClient();
        provider = new ParticipantLogProvider(mockMongoClient as any, dbName, collectionName);
    });
    it("should propagate storeLog promise rejection", async () => {
        mockMongoClient.config.collectionConfig.insertOne.throwError = true;
        await expect(provider.storeLog({})).to.reject();
    });
});
