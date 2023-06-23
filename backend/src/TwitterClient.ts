import { TwitterApi } from "twitter-api-v2";
import * as GetTweetsApi from "./common/getTweetsApi";

const MAX_HOME_TIMELINE_BATCH_SIZE = 100;

interface TwitterClientConfig {
    /** From Twitter Developers account. */
    clientId: string;
    /** From Twitter Developers account. */
    clientSecret: string;

    /** Should be one of the URLs configured in Twitter Developers account. */
    callbackUrl: string;
}

/**
 * Twitter client that handles authentication and fetching data from Twitter.
 *
 * @author Silas Hsu
 */
export class TwitterClient {
    private _config: TwitterClientConfig;

    /**
     * Wraps the default constructor.
     *
     * @param args configuration object
     */
    static defaultFactory(...args: ConstructorParameters<typeof TwitterClient>): TwitterClient {
        return new TwitterClient(...args);
    }

    constructor(config: TwitterClientConfig) {
        this._config = config;
    }

    /**
     * Using a user's authorization code and code verifier string, gets home timeline tweets from that user.
     * Authorization codes can only be retrieved by directing an end user to
     * https://twitter.com/i/oauth2/authorize.  Therefore, the code and code verifier must come from the frontend.
     *
     * If the request fails, the promise will reject with an error object specified in this document:
     * https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/errors.md
     *
     * @param code user's authorization code
     * @param codeVerifier original unhashed code verifier string as specified by PKCE
     * @param howMany - the number of tweets to get.
     * @return promise for a list of Tweets on the user's home timeline
     */
    async getHomeTimeline(code: string, codeVerifier: string, howMany: number): Promise<GetTweetsApi.ResponsePayload> {
        const batchSize = Math.min(howMany, MAX_HOME_TIMELINE_BATCH_SIZE);

        const api = new TwitterApi({clientId: this._config.clientId, clientSecret: this._config.clientSecret});
        const authedApi = await api.loginWithOAuth2({code, codeVerifier, redirectUri: this._config.callbackUrl});
        const paginator = await authedApi.client.v2.homeTimeline({
            max_results: batchSize,
            expansions: [
                "attachments.media_keys", "author_id", "referenced_tweets.id", "referenced_tweets.id.author_id"
            ],
            "tweet.fields": [
                "author_id", "created_at", "public_metrics", "referenced_tweets", "text", "entities"
            ],
            "user.fields": ["name", "username", "profile_image_url"],
            "media.fields": "url",
        });

        while (!paginator.done && paginator.tweets.length < howMany) {
            await paginator.fetchNext(Math.min(howMany - paginator.tweets.length, MAX_HOME_TIMELINE_BATCH_SIZE));
        }

        return {
            data: paginator.tweets,
            includes: {
                tweets: paginator.includes.tweets,
                users: paginator.includes.users,
                media: paginator.includes.media
            }
        };
    }
}
