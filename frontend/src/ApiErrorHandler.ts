import { AxiosError } from "axios";
import { ApiErrorPayload } from "../../common/src/apiErrorPayload";

/**
 * Helper for parsing and handling errors from our API.
 * 
 * @author Silas Hsu
 */
export class ApiErrorHandler {
    /** Whether this instance is logging unexpected errors to the console. */
    public isLoggingUnknownErrors: boolean;

    /**
     * Makes a new instance with desired configuration.
     * 
     * @param isLoggingUnknownErrors - whether to log unexpected errors to the console
     */
    constructor(isLoggingUnknownErrors=true) {
        this.isLoggingUnknownErrors = isLoggingUnknownErrors
    }

    _isAxiosError(error: any): error is AxiosError {
        return error.isAxiosError !== undefined;
    }

    /**
     * To the best of our ability, gets a user-friendly reason for any error that happens when using Axios to make an
     * Twitter-related API call to the backend.
     * 
     * @param error - error from Axios
     * @return user-friendly reason for the error
     */
    getTwitterApiErrorReason(error: any): string {
        if (this._isAxiosError(error)) {
            if (error.response) {
                const prefix = `HTTP ${error.response.status} ${error.response.statusText} -- `;
                if (error.response.status === 500) {
                    return prefix + "probably a bug on our end.";
                } else {
                    const responseData = error.response.data as ApiErrorPayload;
                    return prefix + responseData.message;
                }
            } else if (error.request) {
                return "No response from server.";
            } // else some problem with setting up the request.
            // Probably a bug, so we can't really return a user-friendly reason.
        }

        if (this.isLoggingUnknownErrors) {
            console.error(error);
        }
        return "unknown.";
    }
}
