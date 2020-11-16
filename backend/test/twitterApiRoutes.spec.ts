import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { Server } from "@hapi/hapi";
import * as querystring from "querystring";
import { stub } from "sinon";

import { createTestServer } from "./createTestServer";
import { MockMongoClient } from "./mockObjects/MockMongoClient";
import { TwitterErrorResponseCodes } from "./mockObjects/MockTwitterClient";

import twitterApiRoutes from "../src/routes/twitterApiRoutes";
import { TwitterClient } from "../src/TwitterClient";
import * as RequestTokenApi from "../src/common/requestTokenApi";
import * as GetTweetsApi from "../src/common/getTweetsApi";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Server twitter api routes testing ->", () => {
    let server: Server;
    let twitterClient: TwitterClient;

    type QueryParameters = {
        [index: string]: string | number | boolean | string[] | number[] | boolean[] | null | undefined
    };

    function getRequestTokenRes(queryParams?: QueryParameters) {
        const urlSegments = [
            RequestTokenApi.PATH,
        ];
        if (queryParams) {
            urlSegments.push(...[
                RequestTokenApi.PATH.endsWith("?") ? "" : "?",
                querystring.stringify(queryParams)
            ]);
        }
        return server.inject({
            method: RequestTokenApi.METHOD,
            url: urlSegments.join(""),
        });
    }

    function getTweetsRes(queryParams: QueryParameters) {
        const url = [
            GetTweetsApi.PATH,
            GetTweetsApi.PATH.endsWith("?") ? "" : "?",
            querystring.stringify(queryParams)
        ].join("");
        return server.inject({
            method: GetTweetsApi.METHOD,
            url,
        });
    }

    beforeEach(async () => {
        twitterClient = new TwitterClient({ consumer_key: "", consumer_secret: "" });
        server = createTestServer(new MockMongoClient());
        twitterApiRoutes(server, () => twitterClient);
    });

    afterEach(async () => {
        await server.stop();
    });

    it(`should respond with oauth token when calling ${RequestTokenApi.PATH}`, async () => {
        twitterClient.getRequestToken = stub().returns({oauth_token: "oauth_token"});
        const res = await getRequestTokenRes();
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.be.not.undefined();
        expect((JSON.parse(res.payload) as RequestTokenApi.ResponsePayload).oauth_token).to.equal("oauth_token");
    });

    it(`should respond with appropriate messages for getRequestToken errors when calling ${RequestTokenApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                twitterClient.getRequestToken = stub().throws(code);
                const res = await getRequestTokenRes();
                expect(res.statusCode).to.be.in.range(500, 599);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });

    it(`should get correct query parameters when calling ${RequestTokenApi.PATH}`, async () => {
        const query = {query: "query"};
        twitterClient.getRequestToken = stub().callsFake((arg: string) => ({oauth_token: arg}));
        const res = await getRequestTokenRes(query);
        expect(
            (JSON.parse(res.payload) as RequestTokenApi.ResponsePayload)
                .oauth_token
                .endsWith(querystring.stringify(query))
        ).to.be.true();
    });

    it(`should respond with message when calling ${GetTweetsApi.PATH}`, async () => {
        const params = {oauth_token: "o", oauth_verifier: "o"};
        twitterClient.getTweets = stub().returns([{full_text: "tweets"}]);
        twitterClient.getAccessToken = stub().returns(params);
        const res = await getTweetsRes(params);
        expect((JSON.parse(res.payload) as GetTweetsApi.ResponsePayload).tweets[0].full_text).to.equal("tweets");
    });

    it(`should respond with appropriate messages for getAccessToken errors when calling ${GetTweetsApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                twitterClient.getAccessToken = stub().throws(code);
                const res = await getTweetsRes({oauth_token: "o", oauth_verifier: "o"});
                expect(res.statusCode).to.be.in.range(500, 599);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });

    it(`should respond with appropriate messages for getTweets errors when calling ${GetTweetsApi.PATH}`,
        async () => {
            for (const code of Object.values(TwitterErrorResponseCodes) as number[]) {
                const params = {oauth_token: "o", oauth_verifier: "o"};
                twitterClient.getAccessToken = stub().returns(params);
                twitterClient.getTweets = stub().throws(code);
                const res = await getTweetsRes(params);
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
                twitterClient.getTweets = stub().throws(TwitterErrorResponseCodes["Bad Request"]);
                const res = await getTweetsRes(query);
                expect(res.statusCode).to.equal(400);
                expect(res.statusMessage).to.be.not.undefined();
            }
        });
});
