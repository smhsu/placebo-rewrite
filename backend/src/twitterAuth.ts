import { Server } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import Twitter = require("twitter-lite");
import * as RequestTokenApi from "./common/requestTokenApi";
import * as HandleAccessTokenApi from "./common/handleAccessTokenApi";

/**
 * 
 * @param {Hapi.Server} server 
 */
export function registerRoutes(server: Server) {
    if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET || !process.env.CALLBACK_URL) {
        throw new Error("Needed Twitter app keys unset in environment variables!");
    }

    const callbackUrl = process.env.CALLBACK_URL;
    // @ts-ignore (see issue https://github.com/draftbit/twitter-lite/issues/83)
    const twitterClient: Twitter.Twitter = new Twitter({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET
    });

    server.route({
        method: RequestTokenApi.METHOD,
        path: RequestTokenApi.PATH,
        handler: async function(request, h) {
            try {
                const response = await twitterClient.getRequestToken(callbackUrl);
                console.log(response);
                return { oauth_token: response.oauth_token };
            } catch (err) {
                request.log("error", err);
                return Boom.badGateway();
            }
        }
    });

    server.route({
        method: HandleAccessTokenApi.METHOD,
        path: HandleAccessTokenApi.PATH,
        handler: async function(request, h) {
            if (!HandleAccessTokenApi.checkQueryParams(request.query)) {
                return Boom.badRequest("Missing required query parameters.");
            }

            try {
                const response = await twitterClient.getAccessToken({
                    key: request.query.oauth_token,
                    verifier: request.query.oauth_verifier,
                    secret: process.env.CONSUMER_SECRET
                });
                return response;
            } catch (err) {
                request.log("error", err);
                return Boom.badGateway();
            }
        }
    });
}
