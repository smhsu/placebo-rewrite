import { Server } from "@hapi/hapi";
import Boom from "@hapi/boom";
import * as RequestTokenApi from "../../../common/requestTokenApi";
import * as GetTweetsApi from "../../../common/getTweetsApi";
import { TwitterClient, TwitterError } from "../auth/TwitterClient";

/**
 * Registers APIs that relate to authenticating and fetching data from Twitter.
 * 
 * @param server - Hapi server to register routes with
 */
export function registerTwitterRoutes(server: Server) {
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
        handler: async function(request, h) {
            try {
                const response = await twitterClient.getRequestToken(callbackUrl);
                return { oauth_token: response.oauth_token };
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
        handler: async function(request, h) {
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

                return authedTwitterClient.getTweets({count: 200});
            } catch (error) {
                return handleTwitterError(error);
            }
        }
    });
}

/**
 * Returns the proper 500-level error if there is a problem with the Twitter API.
 * 
 * @param error - error thrown while calling the Twitter API
 * @return appropriate Boom error to return to caller of the API
 */
function handleTwitterError(error: unknown) {
    if (error instanceof TwitterError) {
        return new Boom.Boom(
            "There was a problem with Twitter's API, or how the sever was configured to communicate with Twitter.",
            {
                statusCode: 502,
                data: error
            }
        );
    } else {
        return new Boom.Boom("Internal server error", {
            statusCode: 500,
            data: error
        });
    }
}
