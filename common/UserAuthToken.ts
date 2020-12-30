/**
 * User's request token, i.e. permission to access their data.  When combined with an app's keys, can be converted into
 * an access token.
 *
 * These tokens are obtained from Step 2 of the 3-Legged OAuth process described at
 * https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens.
 */
export interface UserAuthToken {
    oauth_verifier: string;
    oauth_token: string;
}

/**
 * Extracts an UserAuthToken from a dictionary, or null if there is no access token present.
 *
 * @param parsedParams - parsed query parameter dictionary
 * @return object containing the right query parameters, or null if extraction failed
 */
export function extractTokenFromQueryParams(
    parsedParams: Record<string, string | string[] | undefined>
): UserAuthToken | null {
    const oauth_verifier = getLast("oauth_verifier");
    const oauth_token = getLast("oauth_token");
    if (oauth_token && oauth_verifier) {
        return {oauth_token, oauth_verifier};
    } else {
        return null;
    }

    /**
     * Gets the last value of a query parameter, in case it was specified more than once.
     *
     * @param key - parameter name whose value to get
     * @return the parameter value, or null if it doesn't exist
     */
    function getLast(key: string): string | null {
        const value = parsedParams[key];
        if (value === undefined) {
            return null;
        } else if (Array.isArray(value)) {
            return value[value.length - 1];
        } else {
            return value;
        }
    }
}
