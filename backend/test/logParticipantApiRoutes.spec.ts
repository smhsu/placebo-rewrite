import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as StoreParticipantLogsApi from "../../common/logParticipantApi";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();


describe("Server log routes testing -> ", () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    function getRes(payload: any) {
        return server.inject({
            method: StoreParticipantLogsApi.METHOD,
            url: StoreParticipantLogsApi.PATH,
            payload
        });
    }
    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        server = await createServer(mongoClient);
    });
    afterEach(async () => {
        await server.stop();
    });
    it(`should respond with appropriate error messages for 
    request payload errors when calling ${StoreParticipantLogsApi.PATH}`,
    async () => {
        const res = await getRes({});
        expect(res.statusCode).to.equal(400);
        expect(res.statusMessage).to.be.not.undefined();
    });
    it(`should respond with appropriate error messages for db errors when calling ${StoreParticipantLogsApi.PATH}`,
        async () => {
            mongoClient.config.collectionConfig.insertOne.throwError = true;
            const res = await getRes({data: {anything: "anything"}});
            expect(res.statusCode).to.be.in.range(500, 599);
        // FIXME: should return some error messages
        // expect(res.statusMessage).to.be.not.undefined();
        });
    it(`should respond with correctly when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        const res = await getRes({data: {}});
        expect(res.statusCode).to.be.in.range(200, 299);
    });
});
