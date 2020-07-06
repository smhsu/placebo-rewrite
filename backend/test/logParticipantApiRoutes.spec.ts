import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {Server, ServerInjectResponse} from "@hapi/hapi";
import { createTestServer } from "./createTestServer";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as StoreParticipantLogsApi from "../../common/logParticipantApi";
import {MockParticipantLogProvider} from "./mockObjects/MockParticipantLogProvider";
import logParticipantApiRoutes from "../src/routes/logParticipantApiRoutes";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Server log routes testing -> ", () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    let participantLogProvider: MockParticipantLogProvider;

    function getRes(payload: Record<string, unknown>): Promise<ServerInjectResponse> {
        return server.inject({
            method: StoreParticipantLogsApi.METHOD,
            url: StoreParticipantLogsApi.PATH,
            payload
        });
    }

    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        participantLogProvider = new MockParticipantLogProvider(mongoClient, "", "");
        server = createTestServer(mongoClient);
        logParticipantApiRoutes(server, () => participantLogProvider);
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
            participantLogProvider.config.storeLog.throwError = true;
            const res = await getRes({data: {anything: "anything"}});
            expect(res.statusCode).to.be.in.range(500, 599);
        });

    it(`should respond with correctly when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        const res = await getRes({data: {}});
        expect(res.statusCode).to.be.in.range(200, 299);
    });
});
