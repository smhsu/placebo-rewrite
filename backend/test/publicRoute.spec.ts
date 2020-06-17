import * as Lab from '@hapi/lab';
import {expect} from '@hapi/code';
import {Server} from "@hapi/hapi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";

const { describe, it, beforeEach, afterEach } = Lab.script();


describe('Server public routes Testing', () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    beforeEach(async () => {
        mongoClient = new MockMongoClient();
        server = await createServer(mongoClient);
    });
    afterEach(async () => {
        await server.stop();
    });
    it('responds with 200 for valid public resources', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/'
        });
        expect(res.statusCode).to.equal(200);
    });
    it('responds with 404 for invalid public resources', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/stuff-that-does-not-exist'
        });
        expect(res.statusCode).to.equal(404);
    });
});