import {Server} from "@hapi/hapi";
import Boom from "@hapi/boom";
import * as RequestTokenApi from "../common/src/requestTokenApi";
import * as GetTweetsApi from "../common/src/getTweetsApi";
import { TwitterClient, TwitterError } from "../auth/TwitterClient";

/**
 * Registers APIs that relate to authenticating and fetching data from Twitter.
 *
 * @param server - Hapi server to register routes with
 * @author Silas Hsu
 */
export function registerTwitterRoutes(server: Server): void {
    if (!process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET || !process.env.CALLBACK_URL) {
        throw new Error("Needed Twitter app keys unset in environment variables!");
    }

    const callbackUrl = process.env.CALLBACK_URL;
    const twitterClient = new TwitterClient({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET
    });

    /**
     * The Request Token API gets a request token that can be used to ask for a user's access token on behalf of this
     * app.
     */
    server.route({
        method: RequestTokenApi.METHOD,
        path: RequestTokenApi.PATH,
        handler: async function (request, h) {
            try {
                const response = await twitterClient.getRequestToken(callbackUrl);
                return {oauth_token: response.oauth_token};
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
        handler: async function (request, h) {
            if (!GetTweetsApi.checkQueryParams(request.query)) {
                return Boom.badRequest("Missing required query parameters.");
            }

            try {
                const response = await twitterClient.getAccessToken({
                    oauth_token: request.query.oauth_token,
                    oauth_verifier: request.query.oauth_verifier
                });

                const authedTwitterClient = new TwitterClient({
                    consumer_key: process.env.CONSUMER_KEY,
                    consumer_secret: process.env.CONSUMER_SECRET,
                    access_token_key: response.oauth_token,
                    access_token_secret: response.oauth_token_secret
                });

                const tweets = await authedTwitterClient.getTweets({count: 200});
                return {tweets};
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
