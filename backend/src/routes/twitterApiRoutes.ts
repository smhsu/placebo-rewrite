import querystring from "querystring";
import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import * as RequestTokenApi from "../common/requestTokenApi";
import * as GetTweetsApi from "../common/getTweetsApi";
import { TwitterClient, TwitterError } from "../TwitterClient";

/**
 * Registers APIs that relate to authenticating and fetching data from Twitter.
 *
 * @param server - Hapi server to register routes with
 * @author Silas Hsu
 */
export function registerRoutes(server: Server): void {
    if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET || !process.env.CALLBACK_URL) {
        throw new Error("Needed Twitter app keys unset in environment variables!");
    }

    const consumer_key = process.env.CONSUMER_KEY;
    const consumer_secret = process.env.CONSUMER_SECRET;
    const callbackUrl = process.env.CALLBACK_URL;
    const twitterClient = new TwitterClient({ consumer_key, consumer_secret });

    /**
     * The Request Token API gets a request token that can be used to ask for a user's access token on behalf of this
     * app.  Any query parameters passed to this function will be added to the URL that the client will be redirected
     * to in step 2 of the OAuth flow.
     */
    server.route({
        method: RequestTokenApi.METHOD,
        path: RequestTokenApi.PATH,
        handler: async function(request) {
            const extraQueryParams = querystring.stringify(request.query);
            const callbackPlusQuery = extraQueryParams ? callbackUrl + "?" + extraQueryParams : callbackUrl;

            try {
                const tokenData = await twitterClient.getRequestToken(callbackPlusQuery);
                const response: RequestTokenApi.ResponsePayload = { oauth_token: tokenData.oauth_token };
                return response;
            } catch (error) {
                return handleTwitterError(error);
            }
        }
    });

    /**
     * The Get Tweets API gets a user's home timeline Tweets.  It requires the user's access tokens in the query
     * parameters.
     */
    server.route({
        method: GetTweetsApi.METHOD,
        path: GetTweetsApi.PATH,
        handler: async function(request) {
            const token = GetTweetsApi.extractQueryParams(request.query);
            if (!token) {
                return Boom.badRequest("Missing required query parameters.");
            }

            try {
                const accessToken = await twitterClient.getAccessToken(token);
                const authedTwitterClient = new TwitterClient({
                    consumer_key,
                    consumer_secret,
                    access_token_key: accessToken.oauth_token,
                    access_token_secret: accessToken.oauth_token_secret
                });

                const tweets = await authedTwitterClient.getTweets({ count: 200 });
                const response: GetTweetsApi.ResponsePayload = { tweets };
                return response;
            } catch (error) {
                return handleTwitterError(error);
            }
        }
    });
}

/**
 * When there is a problem with the Twitter API, returns the proper 500-level error and user-facing message in a Boom
 * object.  Note that when returning a Boom error, an error logging event will be emitted, so this method does not and
 * should not log anything.
 *
 * @param error - error thrown while calling the Twitter API
 * @return appropriate Boom error to return to caller of the API
 */
function handleTwitterError(error: unknown) {
    let statusCode: number;
    let messageToUser: string;
    if (error instanceof TwitterError) {
        if (error.statusFromTwitter >= 500 || error.statusFromTwitter < 0) {
            statusCode = 502;
            messageToUser = "Twitter is either down, overloaded, or otherwise having issues -- try again later.";
        } else if (error.statusFromTwitter === 420 || error.statusFromTwitter === 429) {
            statusCode = 502;
            messageToUser = "Twitter request limit exceeded -- try again later.";
        } else {
            // Probably a problem with the way our server is sending requests to Twitter.
            // In any case, the user probably can't do anything about it, so just send a generic message.
            statusCode = 500;
            messageToUser = "Internal server error";
        }
    } else {
        statusCode = 500;
        messageToUser = "Internal server error";
    }

    return new Boom.Boom(messageToUser, {
        statusCode: statusCode,
        data: error // The logger should probably take advantage of this
    });
}
