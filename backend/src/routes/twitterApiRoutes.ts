import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import * as GetTweetsApi from "../common/getTweetsApi";
import { TwitterClient, TwitterClientConfig, TwitterError } from "../TwitterClient";

const NUM_TWEETS_TO_GET = 400;

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

    const twitterClientConfig: TwitterClientConfig = {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackUrl: process.env.CALLBACK_URL
    };

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
            const twitterClient = makeTwitterClient(twitterClientConfig);
            try {
                await twitterClient.authUser(code, code_verifier);
                const tweets = await twitterClient.getTweets(NUM_TWEETS_TO_GET);
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
        if (error.httpStatus >= 500 || error.httpStatus < 0) {
            statusCode = 502;
            messageToUser = "Twitter is either down, overloaded, or otherwise having issues -- try again later.";
        } else if (error.httpStatus === 420 || error.httpStatus === 429) {
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
