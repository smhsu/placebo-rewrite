export const METHOD = "POST";
export const PATH = "/api/request_token";

export interface ResponsePayload {
    /**
     * OAuth token that can be used to ask for a user's access token.  This is step 1 of the 3-Legged OAuth process
     * described at https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens 
     */
    oauth_token: string;
}
