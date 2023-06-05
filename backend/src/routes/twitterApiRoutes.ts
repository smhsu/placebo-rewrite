import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import * as GetTweetsApi from "../common/getTweetsApi";
import { TwitterClient } from "../TwitterClient";
import { ApiRequestError, ApiResponseError } from "twitter-api-v2";

const NUM_TWEETS_TO_GET = 399;

/**
 * Registers APIs that relate to authenticating and fetching data from Twitter.
 *
 * @param server - Hapi server to register routes with
 * @param makeTwitterClient
 * @author Silas Hsu
 */
export default function registerRoutes(
    server: Server, makeTwitterClient = TwitterClient.defaultFactory
): void {
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.CALLBACK_URL) {
        throw new Error("Could not find required Twitter app config environment variables");
    }

    const twitterClient = makeTwitterClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackUrl: process.env.CALLBACK_URL
    });

    /**
     * The Get Tweets API gets a user's home timeline Tweets.  It requires the user's access tokens in the query
     * parameters.
     */
    server.route({
        method: GetTweetsApi.METHOD,
        path: GetTweetsApi.PATH,
        handler: async function(request) {
            if (!GetTweetsApi.verifyRequestBody(request.payload)) {
                return Boom.badRequest("Request body not properly formed");
            }
            const { code, code_verifier } = request.payload;
            try {
                return await twitterClient.getHomeTimeline(code, code_verifier, NUM_TWEETS_TO_GET);
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
function handleTwitterError(error: unknown): Boom.Boom<unknown> {
    let statusCodeToUser = 500;
    let messageToUser = "Internal server error";
    let data = error;

    if (error instanceof ApiRequestError) {
        statusCodeToUser = 502;
        messageToUser = "Twitter is either down, overloaded, or otherwise having issues -- try again later.";
        data = {
            path: error.request.path,
            details: error.requestError
        };
    } else if (error instanceof ApiResponseError) {
        data = {
            path: error.request.path,
            details: error.data
        };

        if (error.code > 500) {
            statusCodeToUser = 502;
            messageToUser = "Twitter is either down, overloaded, or otherwise having issues -- try again later.";
        } else if (error.code === 420 || error.code === 429) {
            statusCodeToUser = 502;
            messageToUser = "Twitter request limit exceeded -- try again later.";
        }
        // If we're down here, probably a problem with the way our server is sending requests to Twitter.
        // In any case, the user probably can't do anything about it, so just send a generic message.
    }

    return new Boom.Boom(messageToUser, {
        statusCode: statusCodeToUser,
        data // The Hapi logger can take advantage of this
    });
}
