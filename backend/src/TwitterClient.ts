import axios, { AxiosError } from "axios";
import { Status } from "twitter-d";
import { uniqBy } from "lodash";

const MAX_HOME_TIMELINE_SIZE = 800;
const MAX_HOME_TIMELINE_BATCH_SIZE = 100;

export interface TwitterClientConfig {
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

    /** The "username" and "password" of our Twitter app encoded as a Base64 string. */
    private _encodedAppAuth: string;

    /** Access token for an authenticated user. */
    private _accessToken: string;

    /** User ID of the currently authenticated user. */
    private _userId: string;

    static defaultFactory(...args: ConstructorParameters<typeof TwitterClient>): TwitterClient {
        return new TwitterClient(...args);
    }

    constructor(config: TwitterClientConfig) {
        this._config = config;
        this._encodedAppAuth = btoa(`${config.clientId}:${config.clientSecret}`);
    }

    /**
     * @return whether this instance is ready to access a user's data.
     */
    get isAuthed(): boolean {
        return this._accessToken !== undefined && this._userId !== undefined;
    }

    /**
     * Generates the header for authorizing Twitter requests on behalf of a user.
     */
    _getUserAuthHeader(): { Authorization: string } {
        return { Authorization: `Bearer ${this._accessToken}` };
    }

    /**
     * Tries to read and parse error messages from Twitter, and throw a TwitterError.  If parsing is unsuccessful,
     * throws a generic error.
     *
     * @param error - an Axios error to reformat and throw
     */
    _reformatAndThrowError(error: AxiosError<unknown>): never {
        if (error.response) { // Response from server available
            throw new TwitterError(error.request.path, error.response.status, error.response.data);
        } else if (error.request) { // Request sent but no response from server
            throw new TwitterError(error.request.path);
        } else { // Something else triggered an error
            throw error;
        }
    }

    /**
     * Using a user's authorization code and code verifier string, authenticates this client to access data on behalf
     * of that specific user.  Authorization codes can only be retrieved by directing an end user to
     * https://twitter.com/i/oauth2/authorize.  Thus the code will come from the frontend.
     *
     * @param code user's authorization code
     * @param code_verifier original unhashed code verifier string as specified by PKCE
     * @return promise that resolves upon successful access to the user's data
     */
    async authUser(code: string, code_verifier: string): Promise<void> {
        // Implementation notes: this effectively satisfies Step 3 in
        // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
        try {
            // Convert the authorization token into an access token
            const accessTokenResponse = await axios.request<OAuthTokenResponse>({
                url: OAUTH_TOKEN_ENDPOINT,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${this._encodedAppAuth}`
                },
                data: new URLSearchParams({
                    client_id: this._config.clientId,
                    grant_type: "authorization_code",
                    redirect_uri: this._config.callbackUrl,
                    code_verifier,
                    code
                }),
                responseType: "json"
            });
            this._accessToken = accessTokenResponse.data.access_token;

            const userIdResponse = await axios.get<CurrentUserInfo>(CURRENT_USER_ENDPOINT, {
                headers: this._getUserAuthHeader(),
                responseType: "json"
            });
            this._userId = userIdResponse.data.data.id;
        } catch (error) {
            this._reformatAndThrowError(error);
        }
    }

    /**
     * Gets home timeline tweets from the currently authenticated user.  Fails if no user is authenticated.
     *
     * @param howMany - the number of tweets to get.
     * @return promise for a list of Tweets on the user's home timeline.
     */
    async getTweets(howMany: number): Promise<Status[]> {
        if (!this.isAuthed) {
            throw new Error("No user authenticated");
        }
        howMany = Math.min(howMany, MAX_HOME_TIMELINE_SIZE);

        // We have to keep track of tweet ids due to the reasons described here:
        // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/guides/working-with-timelines
        let paginationToken = "";
        const tweets: Status[] = [];
        let tweetsRemaining = howMany;
        while (tweetsRemaining > 0) {
            const batchSize = Math.min(tweetsRemaining, MAX_HOME_TIMELINE_BATCH_SIZE);
            // Docs for valid API options:
            // eslint-disable-next-line max-len
            // https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-reverse-chronological
            const apiOptions = {
                max_results: batchSize,
                expansions: "author_id,referenced_tweets.id",
                "tweet.fields": "author_id,created_at,entities"
            };
            if (paginationToken) {
                apiOptions["pagination_token"] = paginationToken;
            }

            let result: any;
            try {
                const url = `https://api.twitter.com/2/users/${this._userId}/timelines/reverse_chronological`;
                const response = await axios.get(url, {
                    params: apiOptions,
                    headers: this._getUserAuthHeader(),
                    responseType: "json"
                });
                result = response.data;
            } catch (error) {
                this._reformatAndThrowError(error);
            }

            paginationToken = result.meta["next_token"];

            tweets.push(...result.data);
            if (result.data.length <= 1) {  // Stop if there are no more results.
                break;
            }

            /*
             * Why do we subtract the max batch size instead of the number of tweets fetched?  The API could return
             * fewer tweets than requested, or even none at all, and we want to ensure the loop terminates.
             */
            tweetsRemaining -= MAX_HOME_TIMELINE_BATCH_SIZE;
        }

        return uniqBy(tweets, "id");
    }
}

/**
 * An error during an API call to Twitter.
 *
 * See https://developer.twitter.com/en/support/twitter-api/error-troubleshooting for standard error payloads.
 */
export class TwitterError extends Error {
    /** HTTP status returned from Twitter's API.  If negative, Twitter didn't respond at all. */
    httpStatus: number;

    constructor(requestPath: string, httpStatus=-1, errorPayload?: unknown) {
        if (httpStatus < 0) {
            super(`${requestPath} -- no response from Twitter endpoint.`);
        } else if (typeof errorPayload === "string") {
            super(`${requestPath} HTTP ${httpStatus} -- ${errorPayload}`);
        } else if (typeof errorPayload === "object" && errorPayload !== null) {
            super(`${requestPath} HTTP ${httpStatus}\n${JSON.stringify(errorPayload)}`);
        } else {
            super(`${requestPath} HTTP ${httpStatus} -- no additional details.`);
        }

        this.name = TwitterError.name;
        this.httpStatus = httpStatus;
    }
}


/** Twitter endpoint for getting an OAuth2 access token, which enables us to make requests on behalf of a user. */
const OAUTH_TOKEN_ENDPOINT = "https://api.twitter.com/2/oauth2/token";
interface OAuthTokenResponse {
    token_type: "bearer",
    expires_in: number;
    access_token: string;
    scope: string;
}

/** Twitter endpoint for getting information on the currently authenticated user. */
const CURRENT_USER_ENDPOINT = "https://api.twitter.com/2/users/me";
/**
 * Response object from GET /2/users/me; contains information on the currently authenticated user.
 *
 * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me
 */
interface CurrentUserInfo {
    data: {
        id: string;
        name: string;
        username: string;
    }
}
