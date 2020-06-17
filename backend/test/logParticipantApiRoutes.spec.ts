import * as Lab from '@hapi/lab';
import {expect} from '@hapi/code';
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import * as StoreParticipantLogsApi from "../../common/logParticipantApi";

const { describe, it, beforeEach, afterEach } = Lab.script();


describe('Server log routes Testing', () => {
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
    it(`responds appropriate error messages for request payload errors when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        const res = await getRes({});
        expect(res.statusCode).to.equal(400);
        expect(res.statusMessage).to.be.not.undefined();
    });
    it(`responds appropriate error messages for db errors when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        mongoClient.config.collectionConfig.insertOne.throwError = true;
        const res = await getRes({data: {anything: 'anything'}});
        expect(res.statusCode).to.be.in.range(400, 499);
        // expect(res.statusMessage).to.be.not.undefined();
    });
    it(`responds correctly when calling ${StoreParticipantLogsApi.PATH}`, async () => {
        const res = await getRes({data: {}});
        expect(res.statusCode).to.be.in.range(200, 299);
        // expect(res.statusMessage).to.be.not.undefined();
    });
});