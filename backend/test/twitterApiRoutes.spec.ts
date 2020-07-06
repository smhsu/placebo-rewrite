import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { Server } from "@hapi/hapi";
import * as RequestTokenApi from "../../common/requestTokenApi";
import * as GetTweetsApi from "../../common/getTweetsApi";
import { createTestServer } from "./createTestServer";
import { MockMongoClient } from "./mockObjects/MockMongoClient";
import { MockTwitterClient, TwitterErrorResponseCodes } from "./mockObjects/MockTwitterClient";
import * as querystring from "querystring";
import twitterApiRoutes from "../src/routes/twitterApiRoutes";

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe("Server twitter api routes testing ->", () => {
    let server: Server;
    let twitterClient: MockTwitterClient;

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
        twitterClient = new MockTwitterClient({ consumer_key: "", consumer_secret: "" });
        server = createTestServer(new MockMongoClient());
        twitterApiRoutes(server, () => twitterClient);
    });

    afterEach(async () => {
        await server.stop();
    });

    it(`should respond with oauth token when calling ${RequestTokenApi.PATH}`, async () => {
        const res = await getRequestTokenRes();
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.be.not.undefined();
        expect((JSON.parse(res.payload) as RequestTokenApi.ResponsePayload).oauth_token).to.equal(server.info.uri);
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

    it(`should get correct query parameters when calling ${RequestTokenApi.PATH}`, async () => {
        const query = {query: "query"};
        const res = await getRequestTokenRes(query);
        expect(
            (JSON.parse(res.payload) as RequestTokenApi.ResponsePayload)
                .oauth_token
                .endsWith(querystring.stringify(query))
        ).to.be.true();
    });

    it(`should respond with message when calling ${GetTweetsApi.PATH}`, async () => {
        const res = await getTweetsRes({oauth_token: "o", oauth_verifier: "o"});
        expect((JSON.parse(res.payload) as GetTweetsApi.ResponsePayload).tweets[0].full_text).to.equal("tweets");
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
