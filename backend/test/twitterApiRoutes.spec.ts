import * as Lab from '@hapi/lab';
import {expect} from '@hapi/code';
import {Server} from "@hapi/hapi";
import {TESTING__twitterApiDependencies} from "../src/routes/twitterApiRoutes";
import * as RequestTokenApi from "../src/common/requestTokenApi";
import * as GetTweetsApi from "../src/common/getTweetsApi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {MockTwitterClient, TwitterErrorResponseCodes} from "./mockObjects/MockTwitterClient";

const { describe, it, beforeEach, afterEach } = Lab.script();

describe('Server twitter api routes Testing', () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    let twitterClient: MockTwitterClient;
    function getRequestTokenRes() {
        return server.inject({
            method: RequestTokenApi.METHOD,
            url: RequestTokenApi.PATH,
        });
    }
    function getTweetsRes(payload: any) {
        return server.inject({
            method: GetTweetsApi.METHOD,
            url: GetTweetsApi.PATH,
            payload
        });
    }
    beforeEach(async () => {
        twitterClient = new MockTwitterClient();
        TESTING__twitterApiDependencies.mockTwitterClient = twitterClient as any;
        mongoClient = new MockMongoClient();
        server = await createServer(mongoClient);
    });
    afterEach(async () => {
        await server.stop();
        TESTING__twitterApiDependencies.mockTwitterClient = null;
    });
    it(`responds with oauth token when calling ${RequestTokenApi.PATH}`, async () => {
        const res = await getRequestTokenRes();
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.be.not.undefined();
        expect((JSON.parse(res.payload) as RequestTokenApi.ResponsePayload).oauth_token).to.equal('oauth_token');
    });
    it(`responds with appropriate messages for getRequestToken errors when calling ${RequestTokenApi.PATH}`, async () => {
        for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
            twitterClient.config.errorType = code;
            twitterClient.config.getRequestToken.throwError = true;
            const res = await getRequestTokenRes();
            expect(res.statusCode).to.be.in.range(500, 599);
            expect(res.statusMessage).to.be.not.undefined();
        }
    });
    it(`responds with message when calling ${GetTweetsApi.PATH}`, async () => {
        const res = await server.inject({
            method: GetTweetsApi.METHOD,
            url: GetTweetsApi.PATH,
            payload: {query: {oauth_token: 'o', oauth_verifier: 'o'}}
        });
        expect((JSON.parse(res.payload) as GetTweetsApi.ResponsePayload).tweets).to.equal('tweets' as any);
    });
    it(`responds with appropriate messages for getAccessToken errors when calling ${GetTweetsApi.PATH}`, async () => {
        for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
            twitterClient.config.errorType = code;
            twitterClient.config.getAccessToken.throwError = true;
            const res = await getTweetsRes({query: {oauth_token: 'o', oauth_verifier: 'o'}});
            expect(res.statusCode).to.be.in.range(500, 599);
            expect(res.statusMessage).to.be.not.undefined();
        }
    });
    it(`responds with appropriate messages for getTweets errors when calling ${GetTweetsApi.PATH}`, async () => {
        for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
            twitterClient.config.errorType = code;
            twitterClient.config.getTweets.throwError = true;
            const res = await getTweetsRes({query: {oauth_token: 'o', oauth_verifier: 'o'}});
            expect(res.statusCode).to.be.in.range(500, 599);
            expect(res.statusMessage).to.be.not.undefined();
        }
    });
    it(`responds with appropriate messages for request payload errors when calling ${GetTweetsApi.PATH}`, async () => {
        const invalidObjects = [
            {}, {oauth_token: 'o'}, {oauth_verifier: 'o'}, {oauth_token: null, oauth_verifier: 'o'},
            {oauth_token: 'o', oauth_verifier: null}
        ];
        const deformedQueries = [
            ...invalidObjects,
            ...invalidObjects.map((item: any) => ({query: item} as any)),
        ];
        for (const query of deformedQueries) {
            twitterClient.config.errorType = TwitterErrorResponseCodes['Bad Request'];
            twitterClient.config.getTweets.throwError = true;
            const res = await getTweetsRes(query);
            expect(res.statusCode).to.equal(400);
            expect(res.statusMessage).to.be.not.undefined();
        }
    });
});