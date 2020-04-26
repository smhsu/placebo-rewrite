declare module "react-twitter-auth" {
    interface TwitterLoginProps {
        ////////////////////
        // Required props //
        ////////////////////

        /**
         * URL to get app's request token (the token that allows the app to request user data).  This endpoint should
         * return a JSON object with schema `{ oauth_token: string }`.  This is the same token that will be sent to
         * Twitter in step 2 described at
         * https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens
         */
        requestTokenUrl: string;

        /**
         * URL that will be given the user's request token (created when the user grants permission to the app). The
         * token will be sent in two query parameters: oauth_token and oauth_verifier.  These shall contain the same
         * data as the "Request from client’s redirect" as described in step 2 of
         * https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens
         */
        loginUrl: string;

        /**
         * Callback that will will be passed the response from loginUrl.  The programmer should examine the HTTP
         * response code, as this component ignores it!
         */
        onSuccess: (response: Response) => void;

        /**
         * Callback for if there is a problem anywhere in the login flow EXCEPT the final response from loginUrl.
         */
        onFailure: (error: Error) => void;


        ///////////////////////////
        // Request customization //
        ///////////////////////////

        /**
         * Indicates whether the user agent should send cookies from the other domain in the case of cross-origin
         * requests. Possible values: "omit", "same-origin", "include"
         */
        credentials?: "omit" | "same-origin" | "include";

        /**
         * Custom headers to be sent to the backend; should be object with fields.  Because of a bug in fetch
         * implementation all keys will be lowercase.
         */
        customHeaders?: HeadersInit;

        /** Whether to force the user to authenticate with Twitter username and password. */
        forceLogin?: boolean;


        ///////////////////////////
        // Styling customization //
        ///////////////////////////

        /** HTML element type of the button. */
        tag?: React.ReactType;

        /** Text of the button. */
        text?: string;

        /** Whether to show a Twitter logo before the next of the button */
        showIcon?: boolean;

        /** Whether to pass the `disabled` HTML attribute to the rendered button. */
        disabled?: boolean;

        /** Custom style of the button. */
        style?: React.CSSProperties;

        /** Override for the default rendered content. */
        children?: React.ReactNode;

        /** Popup dialogue width, in pixels. */
        dialogWidth?: number;

        /** Popup dialogue height, in pixels. */
        dialogHeight?: number;
    }
    
    /**
     * Twitter login component, which shows a login popup to the user.
     * 
     * *Important*: the callback URL which the app is configured with MUST have the same origin as the page that opens
     * the popup window.  Otherwise, the component can't tell whether login succeeded or not, and the popup will stay
     * open.  Then, when the user closes the popup, the `onFailure` callback will still be called, even if the user
     * granted permission.
     * 
     * Thanks to https://github.com/GenFirst/react-twitter-auth/issues/21#issuecomment-494587186 for describing the
     * above gotcha.
     */
    export const TwitterLogin: React.StatelessComponent<TwitterLoginProps>;
    export default TwitterLogin;
};
