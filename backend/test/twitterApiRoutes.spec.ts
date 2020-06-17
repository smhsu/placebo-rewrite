import * as Lab from "@hapi/lab";
import {expect} from "@hapi/code";
import {Server} from "@hapi/hapi";
import {TESTING__twitterApiDependencies} from "../src/routes/twitterApiRoutes";
import * as RequestTokenApi from "../src/common/requestTokenApi";
import * as GetTweetsApi from "../src/common/getTweetsApi";
import {createServer} from "./setUp";
import {MockMongoClient} from "./mockObjects/MockMongoClient";
import {MockTwitterClient, TwitterErrorResponseCodes} from "./mockObjects/MockTwitterClient";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Server twitter api routes testing ->", () => {
    let server: Server;
    let mongoClient: MockMongoClient;
    let twitterClient: MockTwitterClient;
    function getRequestTokenRes() {
        return server.inject({
            method: RequestTokenApi.METHOD,
            url: RequestTokenApi.PATH,
        });
    }
    function getTweetsRes(queryParams: any) {
        let url = GetTweetsApi.PATH;
        if (!url.endsWith("?")) {
            url += "?";
        }
        for (const [key, val] of Object.entries(queryParams)) {
            url += `${key}=${val}&`;
        }
        url = url.slice(0, -1);
        return server.inject({
            method: GetTweetsApi.METHOD,
            url,
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
    it(`should respond with oauth token when calling ${RequestTokenApi.PATH}`, async () => {
        const res = await getRequestTokenRes();
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.be.not.undefined();
        expect((JSON.parse(res.payload) as RequestTokenApi.ResponsePayload).oauth_token).to.equal("oauth_token");
    });
    it(`should respond with appropriate messages for getRequestToken errors when calling ${RequestTokenApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                twitterClient.config.errorType = code;
                twitterClient.config.getRequestToken.throwError = true;
                const res = await getRequestTokenRes();
                expect(res.statusCode).to.be.in.range(500, 599);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });
    it(`should respond with message when calling ${GetTweetsApi.PATH}`, async () => {
        const res = await getTweetsRes({oauth_token: "o", oauth_verifier: "o"});
        expect((JSON.parse(res.payload) as GetTweetsApi.ResponsePayload).tweets).to.equal("tweets" as any);
    });
    it(`should respond with appropriate messages for getAccessToken errors when calling ${GetTweetsApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                twitterClient.config.errorType = code;
                twitterClient.config.getAccessToken.throwError = true;
                const res = await getTweetsRes({oauth_token: "o", oauth_verifier: "o"});
                expect(res.statusCode).to.be.in.range(500, 599);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });
    it(`should respond with appropriate messages for getTweets errors when calling ${GetTweetsApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                twitterClient.config.errorType = code;
                twitterClient.config.getTweets.throwError = true;
                const res = await getTweetsRes({oauth_token: "o", oauth_verifier: "o"});
                expect(res.statusCode).to.be.in.range(500, 599);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });
    it(`should respond with appropriate messages for request payload errors when calling ${GetTweetsApi.PATH}`,
        async () => {
            const invalidObjects = [
                {}, {oauth_token: "o"}, {oauth_verifier: "o"},
            ];
            for (const query of invalidObjects) {
                twitterClient.config.errorType = TwitterErrorResponseCodes["Bad Request"];
                twitterClient.config.getTweets.throwError = true;
                const res = await getTweetsRes(query);
                expect(res.statusCode).to.equal(400);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });
});
