import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { Server, ServerInjectResponse } from "@hapi/hapi";
import { stub } from "sinon";

import { createTestServer } from "./createTestServer";
import { MockMongoClient } from "./mockObjects/MockMongoClient";

import * as ExperimentalConditionApi from "../../common/getExperimentalConditionApi";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";
import registerExperimentalConditionRoutes from "../src/routes/experimentalConditionRoutes";
import { ConditionCountsProvider, ConditionCounts } from "../src/database/ConditionCountsProvider";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Condition assignment routes testing -> ", () => {
    let server: Server;
    let mockConditionCountsProvider: ConditionCountsProvider;

    function getResponse() {
        return server.inject({
            method: ExperimentalConditionApi.METHOD,
            url: ExperimentalConditionApi.PATH,
        });
    }

    function getAssignedCondition(response: ServerInjectResponse): ExperimentalCondition | undefined {
        const parsed = JSON.parse(response.payload) as Partial<ExperimentalConditionApi.ResponsePayload>;
        return parsed.assignment;
    }

    function makeZeroedConuts(): ConditionCounts {
        const allZeros: Partial<ConditionCounts> = {};
        for (const condition of Object.values(ExperimentalCondition)) {
            allZeros[condition] = 0;
        }
        return allZeros as ConditionCounts;
    }

    beforeEach(async () => {
        mockConditionCountsProvider = new ConditionCountsProvider();
        mockConditionCountsProvider.getCounts = stub().throws("Not implemented");
        mockConditionCountsProvider.incrementCount = stub().throws("Not implemented");
        server = createTestServer(new MockMongoClient());
        registerExperimentalConditionRoutes(server, () => mockConditionCountsProvider);
    });

    afterEach(async () => {
        await server.stop();
    });

    it(`should respond with assignment for db errors when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            mockConditionCountsProvider.getCounts = stub().rejects();
            const res = await getResponse();
            expect(res.statusCode).to.equal(200);
            expect(getAssignedCondition(res)).to.be.not.undefined();
        });

    it(`should respond with assignment for empty document when calling ${ExperimentalConditionApi.PATH}`,
        async () => {
            mockConditionCountsProvider.getCounts = stub().returns(makeZeroedConuts());
            const res = await getResponse();
            expect(res.statusCode).to.equal(200);
            expect(getAssignedCondition(res)).to.be.not.undefined();
        });

    it(`should respond with EXPERIMENTAL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        const counts = makeZeroedConuts();
        counts[ExperimentalCondition.POPULARITY_SLIDER] = 69;
        counts[ExperimentalCondition.SWAP_SETTING] = 30;
        mockConditionCountsProvider.getCounts = stub().returns(counts);
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
        expect(getAssignedCondition(res)).to.equal(ExperimentalCondition.POPULARITY_SLIDER);
    });

    it(`should respond with CONTROL when calling ${ExperimentalConditionApi.PATH}`, async () => {
        const counts = makeZeroedConuts();
        counts[ExperimentalCondition.POPULARITY_SLIDER] = 70;
        counts[ExperimentalCondition.SWAP_SETTING] = 29;
        mockConditionCountsProvider.getCounts = stub().returns(counts);
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
        expect(getAssignedCondition(res)).to.equal(ExperimentalCondition.SWAP_SETTING);
    });
});
