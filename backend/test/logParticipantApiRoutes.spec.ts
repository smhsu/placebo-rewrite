import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { Server, ServerInjectResponse } from "@hapi/hapi";
import { stub } from "sinon";

import { createTestServer } from "./createTestServer";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as StoreParticipantLogsApi from "../src/common/logParticipantApi";
import registerLogParticipantApiRoutes from "../src/routes/logParticipantApiRoutes";
import { ParticipantLogProvider } from "../src/database/ParticipantLogProvider";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Server log routes testing -> ", () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    let participantLogProvider: ParticipantLogProvider;

    function getRes(payload: Record<string, unknown>): Promise<ServerInjectResponse> {
        return server.inject({
            method: StoreParticipantLogsApi.METHOD,
            url: StoreParticipantLogsApi.PATH,
            payload
        });
    }

    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        participantLogProvider = new ParticipantLogProvider();
        participantLogProvider.storeLog = stub().throws("Not implemented");
        server = createTestServer(mongoClient);
        registerLogParticipantApiRoutes(server, () => participantLogProvider);
    });

    afterEach(async () => {
        await server.stop();
    });

    it("should respond with appropriate error messages for request payload errors " + 
        `when calling ${StoreParticipantLogsApi.PATH}`,
    async () => {
        const res = await getRes({});
        expect(res.statusCode).to.equal(400);
        expect(res.statusMessage).to.be.not.undefined();
    });

    it(`should respond with appropriate error messages for db errors when calling ${StoreParticipantLogsApi.PATH}`,
        async () => {
            const res = await getRes({data: {anything: "anything"}});
            expect(res.statusCode).to.be.in.range(500, 599);
        });

    it(`should respond correctly when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        participantLogProvider.storeLog = stub().returns("");
        const res = await getRes({data: {}});
        expect(res.statusCode).to.be.in.range(200, 299);
    });
});
