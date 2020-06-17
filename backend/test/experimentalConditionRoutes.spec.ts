import * as Lab from '@hapi/lab';
import {expect} from '@hapi/code';
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as ExperimentalConditionApi from "../../common/getExperimentalConditionApi";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";

const { describe, it, beforeEach, afterEach } = Lab.script();

describe('Server condition assignment routes Testing', () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    function getRes() {
        return server.inject({
            method: ExperimentalConditionApi.METHOD,
            url: ExperimentalConditionApi.PATH,
        });
    }
    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        server = await createServer(mongoClient);
    });
    afterEach(async () => {
        await server.stop();
    });
    it(`responds with assignment for db errors when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.findOne.throwError = true;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect((JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment).to.be.not.undefined();
    });
    it(`responds with assignment for empty document when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.findOne.notFind = true;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect((JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment).to.be.not.undefined();
    });
    it(`responds with EXPERIMENTAL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.EXPERIMENTAL] = 29;
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.CONTROL] = 70;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect((JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment).to.equal(ExperimentalCondition.EXPERIMENTAL);
    });
    it(`responds with CONTROL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.EXPERIMENTAL] = 30;
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.CONTROL] = 69;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect((JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment).to.equal(ExperimentalCondition.CONTROL);
    });
});