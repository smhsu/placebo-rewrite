import {AccessToken, RequestToken, TwitterClient, TwitterError} from "../../src/TwitterClient";
import {Status} from "twitter-d";

export enum TwitterErrorResponseCodes {
    "Bad Request" = 400,
    "Unauthorized" = 401,
    "Forbidden" = 403,
    "Not Found" = 404,
    "Not Acceptable" = 406,
    "Gone" = 410,
    "Enhance Your Calm" = 420,
    "Unprocessable Entity" = 422,
    "Too Many Requests" = 429,
    "Internal Server Error" = 500,
    "Bad Gateway" = 502,
    "Service Unavailable" = 503,
    "Gateway timeout" = 504,
}

export class MockTwitterClient extends TwitterClient {
    config = {
        errorType: null as null | TwitterErrorResponseCodes,
        getRequestToken: {
            throwError: false,
        },
        getAccessToken: {
            throwError: false,
        },
        getTweets: {
            throwError: false,
        },
    }
    private generateError = (): void => {
        if (this.config.errorType) {
            throw new TwitterError("testing", this.config.errorType);
        }
    }
    getRequestToken = async (url: string): Promise<RequestToken> => {
        if (this.config.getRequestToken.throwError) {
            this.generateError();
        }
        return {
            oauth_callback_confirmed: true,
            oauth_token_secret: "",
            oauth_token: url
        };
    }
    getAccessToken = async (): Promise<AccessToken> => {
        if (this.config.getAccessToken.throwError) {
            this.generateError();
        }
        return {
            screen_name: "",
            user_id: "",
            oauth_token: "oauth_token",
            oauth_token_secret: "oauth_token_secret"
        };
    }
    getTweets = async (): Promise<Status[]> => {
        if (this.config.getTweets.throwError) {
            this.generateError();
        }
        const tweet: Status = {
            created_at: "",
            entities: undefined,
            favorite_count: 0,
            favorited: false,
            id: 0,
            id_str: "",
            is_quote_status: false,
            retweet_count: 0,
            retweeted: false,
            source: "",
            truncated: false,
            user: undefined,
            full_text: "tweets"
        };
        return [tweet];
    }
}
