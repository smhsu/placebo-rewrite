import randomstring from "randomstring";

const CODE_VERIFIER_STORAGE_KEY = "code_verifier";
const STATE_STORAGE_KEY = "oauth_state";

export function getStoredAuthVerifiers() {
    return {
        code_verifier: window.sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY),
        state: window.sessionStorage.getItem(STATE_STORAGE_KEY)
    }
}

export function deleteAuthVerifiers() {
    window.sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);
    window.sessionStorage.removeItem(STATE_STORAGE_KEY);
}

/**
 * Generates a URL, which when visited, prompts a user to authorize the app to access their data.  Then redirects the
 * user back to our app, with the authorization code in the query parameters if the user accepted.
 *
 * See https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token for more information.
 */
export async function generateTwitterAuthUrl(): Promise<string> {
    if (!process.env.REACT_APP_CLIENT_ID || !process.env.REACT_APP_CALLBACK_URL) {
        throw new Error("REACT_APP_CLIENT_ID and REACT_APP_CALLBACK_URL environment vars are required.")
    }

    const codeVerifier = randomstring.generate(128);
    const state = randomstring.generate(10);
    window.sessionStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier);
    window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
    const code_challenge = await generateCodeChallenge(codeVerifier);

    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.REACT_APP_CLIENT_ID || "");
    authUrl.searchParams.set("redirect_uri", process.env.REACT_APP_CALLBACK_URL || "");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", code_challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("scope", "tweet.read users.read");
    return authUrl.toString();
}

/**
 * Constructs the code_challenge of the OAuth 2.0 authorize URL.  See
 * https://www.oauth.com/oauth2-servers/pkce/authorization-request/
 *
 * @param codeVerifier a random string eventually used to verify subsequent oauth requests
 */
async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64Digest = window.btoa(String.fromCharCode(...new Uint8Array(digest)));
    // you can extract this replacing code to a function
    return base64Digest
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
