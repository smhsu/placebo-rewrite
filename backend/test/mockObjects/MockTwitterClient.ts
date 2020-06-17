import {TwitterError} from "../../src/TwitterClient";

export enum TwitterErrorResponseCodes {
    'Bad Request' = 400,
    'Unauthorized' = 401,
    'Forbidden' = 403,
    'Not Found' = 404,
    'Not Acceptable' = 406,
    'Gone' = 410,
    'Enhance Your Calm' = 420,
    'Unprocessable Entity' = 422,
    'Too Many Requests' = 429,
    'Internal Server Error' = 500,
    'Bad Gateway' = 502,
    'Service Unavailable' = 503,
    'Gateway timeout' = 504,
}

export class MockTwitterClient {
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
    private generateError = () => {
        if (this.config.errorType) {
            throw new TwitterError('testing', this.config.errorType);
        }
    }
    getRequestToken = async () => {
        if (this.config.getRequestToken.throwError) {
            this.generateError();
        }
        return {
            oauth_token: 'oauth_token'
        }
    }
    getAccessToken = async () => {
        if (this.config.getAccessToken.throwError) {
            this.generateError();
        }
        return {
            oauth_token: 'oauth_token',
            oauth_token_secret: 'oauth_token_secret'
        }
    }
    getTweets = async () => {
        if (this.config.getTweets.throwError) {
            this.generateError();
        }
        return 'tweets';
    }
}