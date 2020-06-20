import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as ExperimentalConditionApi from "../../common/getExperimentalConditionApi";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Condition assignment routes testing -> ", () => {
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
    it(`should respond with assignment for db errors when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            mongoClient.config.collectionConfig.findOne.throwError = true;
            const res = await getRes();
            expect(res.statusCode).to.equal(200);
            expect(
                (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
            ).to.be.not.undefined();
        });
    it(`should respond with assignment for empty document when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            mongoClient.config.collectionConfig.findOne.notFind = true;
            const res = await getRes();
            expect(res.statusCode).to.equal(200);
            expect(
                (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
            ).to.be.not.undefined();
        });
    it(`should respond with EXPERIMENTAL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.POPULARITY_SLIDER] = 69;
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.RANDOMIZER_SETTING] = 30;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect(
            (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
        ).to.equal(ExperimentalCondition.POPULARITY_SLIDER);
    });
    it(`should respond with CONTROL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.POPULARITY_SLIDER] = 70;
        mongoClient.config.collectionConfig.conditionCounts[ExperimentalCondition.RANDOMIZER_SETTING] = 29;
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect(
            (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
        ).to.equal(ExperimentalCondition.RANDOMIZER_SETTING);
    });
});
