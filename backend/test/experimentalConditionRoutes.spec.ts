import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { Server, ServerInjectResponse } from "@hapi/hapi";
import { stub } from "sinon";

import { createTestServer } from "./createTestServer";
import { MockMongoClient } from "./mockObjects/MockMongoClient";

import * as ExperimentalConditionApi from "../src/common/getExperimentalConditionApi";
import { ExperimentalCondition } from "../src/common/ExperimentalCondition";
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

    function getAssignedCondition(response: ServerInjectResponse): ExperimentalCondition {
        const parsed = JSON.parse(response.payload) as ExperimentalConditionApi.ResponsePayload;
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

        const desiredProportions = makeZeroedConuts();
        desiredProportions[ExperimentalCondition.POPULARITY_SLIDER] = 0.6;
        desiredProportions[ExperimentalCondition.NO_SETTING] = 0.2;
        desiredProportions[ExperimentalCondition.SWAP_SETTING] = 0.2;
        registerExperimentalConditionRoutes(server, () => mockConditionCountsProvider, desiredProportions);
    });

    afterEach(async () => {
        await server.stop();
    });

    it("should respond with assignment even when the database cannot provide counts", async () => {
        mockConditionCountsProvider.getCounts = stub().rejects();
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
    });

    it("should respond with an assignment when there are no counts stored in the database", async () => {
        mockConditionCountsProvider.getCounts = stub().returns(makeZeroedConuts());
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
    });

    it("should respond with POPULARITY_SLIDER when there is such a shortage", async () => {
        const counts = makeZeroedConuts();
        counts[ExperimentalCondition.POPULARITY_SLIDER] = 59; // Relies on the proportions defined in beforeEach
        counts[ExperimentalCondition.NO_SETTING] = 20;
        counts[ExperimentalCondition.SWAP_SETTING] = 20;
        mockConditionCountsProvider.getCounts = stub().returns(counts);
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
        expect(getAssignedCondition(res)).to.equal(ExperimentalCondition.POPULARITY_SLIDER);
    });

    it("should respond with SWAP_SETTING when there is such a shortage", async () => {
        const counts = makeZeroedConuts();
        counts[ExperimentalCondition.POPULARITY_SLIDER] = 60;
        counts[ExperimentalCondition.NO_SETTING] = 19;
        counts[ExperimentalCondition.SWAP_SETTING] = 18;
        mockConditionCountsProvider.getCounts = stub().returns(counts);
        const res = await getResponse();
        expect(res.statusCode).to.equal(200);
        expect(getAssignedCondition(res)).to.equal(ExperimentalCondition.SWAP_SETTING);
    });

    it("should increment the database after returning a result", async () => {
        mockConditionCountsProvider.getCounts = stub().returns(makeZeroedConuts());
        const incrementCountStub = stub().resolves();
        mockConditionCountsProvider.incrementCount = incrementCountStub;
        const res = await getResponse();

        expect(res.statusCode).to.equal(200);
        const assignment = getAssignedCondition(res);
        expect(incrementCountStub.calledOnceWith(assignment));
    });
});
