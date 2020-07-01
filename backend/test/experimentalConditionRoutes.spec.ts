import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as ExperimentalConditionApi from "../../common/getExperimentalConditionApi";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";
import {MockConditionCountsProvider} from "./mockObjects/MockConditionCountsProvider";
import experimentalConditionRoutes from "../src/routes/experimentalConditionRoutes";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Condition assignment routes testing -> ", () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    let conditionCountsProvider: MockConditionCountsProvider;

    function getRes() {
        return server.inject({
            method: ExperimentalConditionApi.METHOD,
            url: ExperimentalConditionApi.PATH,
        });
    }

    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        conditionCountsProvider = new MockConditionCountsProvider(mongoClient, "", "");
        server = createServer(mongoClient);
        experimentalConditionRoutes(server, () => conditionCountsProvider);
    });

    afterEach(async () => {
        await server.stop();
    });

    it(`should respond with assignment for db errors when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            conditionCountsProvider.config.getCounts.throwError = true;
            const res = await getRes();
            expect(res.statusCode).to.equal(200);
            expect(
                (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
            ).to.be.not.undefined();
        });

    it(`should respond with assignment for empty document when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            Object.values(ExperimentalCondition).forEach(
                val => conditionCountsProvider.config.getCounts.counts.set(val, 0)
            );
            const res = await getRes();
            expect(res.statusCode).to.equal(200);
            expect(
                (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
            ).to.be.not.undefined();
        });

    it(`should respond with EXPERIMENTAL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        conditionCountsProvider.config.getCounts.counts.set(ExperimentalCondition.POPULARITY_SLIDER, 69);
        conditionCountsProvider.config.getCounts.counts.set(ExperimentalCondition.RANDOMIZER_SETTING, 30);
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect(
            (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
        ).to.equal(ExperimentalCondition.POPULARITY_SLIDER);
    });

    it(`should respond with CONTROL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        conditionCountsProvider.config.getCounts.counts.set(ExperimentalCondition.POPULARITY_SLIDER, 70);
        conditionCountsProvider.config.getCounts.counts.set(ExperimentalCondition.RANDOMIZER_SETTING, 29);
        const res = await getRes();
        expect(res.statusCode).to.equal(200);
        expect(
            (JSON.parse(res.payload) as ExperimentalConditionApi.ResponsePayload).assignment
        ).to.equal(ExperimentalCondition.RANDOMIZER_SETTING);
    });
});
