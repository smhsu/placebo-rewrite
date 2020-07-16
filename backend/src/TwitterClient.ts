import crypto from "crypto";
import OAuth from "oauth-1.0a";
import axios, {AxiosError} from "axios";
import querystring from "querystring";
import {Status} from "twitter-d";

const AUTH_BASE_URL = "https://api.twitter.com/oauth";
const API_BASE_URL = "https://api.twitter.com/1.1";

/**
 * OAuth tokens config.
 */
interface TwitterClientConfig {
    /** App key from your Twitter Developers account. */
    consumer_key: string;

    /** App secret from your Twitter Developers account. */
    consumer_secret: string;

    /** Access token key associated with one user's account. */
    access_token_key?: string;

    /** Access token secret associated with one user's account. */
    access_token_secret?: string;
}

/** Token that can be used to request an access token from a Twitter user. */
export interface RequestToken {
    oauth_token: string;
    oauth_token_secret: string;
    oauth_callback_confirmed: true;
}

/** Access token data for one Twitter user. */
export interface AccessToken {
    oauth_token: string;
    oauth_token_secret: string;
    user_id: string;
    screen_name: string;
}

/**
 * Parameters for Twitter's home_timeline API as described in
 * https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline
 */
interface GetTweetsOptions {
    /** Number of Tweets to get. */
    count: number;
}

/**
 * Twitter client that handles OAuth flow and fetching data from Twitter.  This class partially implements the flow
 * described in https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens
 *
 * @author Silas Hsu
 */
export class TwitterClient {
    private _config: TwitterClientConfig;
    private _oauthClient: OAuth;

    static defaultFactory(...args: ConstructorParameters<typeof TwitterClient>): TwitterClient {
        return new TwitterClient(...args);
    }

    constructor(config: TwitterClientConfig) {
        this._config = config;
        this._oauthClient = this._createOAuthClient();
    }

    /**
     * @return whether this instance was configued with an access token.
     */
    get hasAccessToken(): boolean {
        return this._config.access_token_key !== undefined && this._config.access_token_secret !== undefined;
    }

    _createOAuthClient(): OAuth {
        return new OAuth({
            consumer: {
                key: this._config.consumer_key,
                secret: this._config.consumer_secret
            },
            signature_method: "HMAC-SHA1",
            hash_function: (baseString: string, key: string) =>
                crypto
                    .createHmac("sha1", key)
                    .update(baseString)
                    .digest("base64")
        });
    }

    /**
     * Makes HTTP headers that contain a OAuth signature.
     *
     * @param url - the URL that the HTTP request will be made to.  Should include query parameters, if any.
     * @param method - HTTP request method
     * @return headers contained in an object
     */
    _makeOAuthHeaders(url: string, method: "GET" | "POST"): OAuth.Header {
        let token: OAuth.Token | undefined;
        if (this.hasAccessToken) {
            token = { // this.hasAccessToken ensures these are strings and not undefined.
                key: this._config.access_token_key as string,
                secret: this._config.access_token_secret as string
            };
        }
        const signature = this._oauthClient.authorize({url, method}, token);
        return this._oauthClient.toHeader(signature);
    }

    /**
     * Tries to read and parse error messages from Twitter, and throw a TwitterError.  If parsing is unsuccessful,
     * throws a generic error.
     *
     * @param error - an Axios error to reformat and throw
     */
    _reformatAndThrowError(error: AxiosError): void {
        if (error.response) { // Response from server available
            const data = error.response.data;
            const messagePrefix = `${error.request.path} HTTP ${error.response.status}: `;
            let reason: string;
            if (Array.isArray(data.errors) && data.errors.length > 0) {
                // Handle standard Twitter error response format.
                // (see https://developer.twitter.com/en/docs/ads/general/guides/response-codes)
                // Just use the first error's message.
                reason = data.errors[0].message;
            } else {
                // Some other error response from Twitter?
                reason = typeof data.toString === "function" ? data.toString() : "unknown";
            }

            throw new TwitterError(messagePrefix + reason, error.response.status);
        } else if (error.request) { // Request sent but no response from server
            throw new TwitterError("No response from Twitter endpoint.");
        } else { // Something else triggered an error
            throw error;
        }
    }

    /**
     * Gets an OAuth token that can be used to ask for a user's access token.  This is step 1 of the 3-Legged OAuth
     * process.
     *
     * @param callbackUrl - URL from your Twitter Developers account.  See the README for more information.
     * @return promise for the OAuth request token
     */
    async getRequestToken(callbackUrl: string): Promise<RequestToken> {
        const url = `${AUTH_BASE_URL}/request_token?${querystring.stringify({ oauth_callback: callbackUrl })}`;

        let response;
        try {
            response = await axios.post<string>(url, undefined, {
                headers: this._makeOAuthHeaders(url, "POST"),
                responseType: "text"
            });
        } catch (error) {
            this._reformatAndThrowError(error);
        }

        return querystring.parse(response.data) as unknown as RequestToken;
    }

    /**
     * Given a user's request token (i.e. permission to access their data), requests their access token from Twitter.
     *
     * @param token - user's request token, i.e. permission to access their data
     * @return promise for the user's access token
     */
    async getAccessToken(token: { oauth_token: string, oauth_verifier: string }): Promise<AccessToken> {
        const url = `${AUTH_BASE_URL}/access_token?${querystring.stringify(token)}`;

        let response;
        try {
            response = await axios.post<string>(url, undefined, {
                headers: this._makeOAuthHeaders(url, "POST"),
                responseType: "text"
            });
        } catch (error) {
            this._reformatAndThrowError(error);
        }

        return querystring.parse(response.data) as unknown as AccessToken;
    }

    /**
     * Gets a user's home timeline Tweets.  An access token must have been configured in the constructor, i.e. a user
     * must be authenticated, otherwise this method will not work.
     *
     * The `options` parameter corresponds to Twitter's API parameters as described in
     * https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline
     *
     * @param options - parameters to pass to Twitter's API
     * @return promise for a list of Tweets on the authenticated user's home timeline.
     */
    async getTweets(options: GetTweetsOptions): Promise<Status[]> {
        if (!this.hasAccessToken) {
            throw new Error("No access token configured -- cannot use this API without one.");
        }

        // Always get extended tweets.  It makes "full_text" instead of "text" show up in Tweet data.  For more, see
        // https://developer.twitter.com/en/docs/tweets/tweet-updates
        const extendedOptions = {...options, tweet_mode: "extended"};
        const url = `${API_BASE_URL}/statuses/home_timeline.json?${querystring.stringify(extendedOptions)}`;
        let response;
        try {
            response = await axios.get<Status[]>(url, {
                headers: this._makeOAuthHeaders(url, "GET"),
                responseType: "json"
            });
        } catch (error) {
            this._reformatAndThrowError(error);
        }
        return response.data;
    }
}

/**
 * An error during an API call to Twitter.
 */
export class TwitterError extends Error {
    /** HTTP status returned from Twitter's API.  If negative, Twitter didn't respond at all. */
    statusFromTwitter: number;

    constructor(message: string, statusFromTwitter = -1) {
        super(message);
        this.name = TwitterError.name;
        this.statusFromTwitter = statusFromTwitter;
    }
}
