import { AxiosError } from "axios";
import { isApiErrorPayload } from "./common/apiErrorPayload";

/**
 * Helper for parsing and handling errors from our API.
 * 
 * @author Silas Hsu
 */
export class ApiErrorHandler {
    _isAxiosError(error: unknown): error is AxiosError<unknown> {
        return typeof error === "object" &&
            error !== null &&
            (error as Record<string, unknown>).isAxiosError !== undefined;
    }

    /**
     * To the best of our ability, gets a user-friendly reason for any error that happens when using Axios, especially
     * those that made a Twitter-related API call to the backend.
     * 
     * @param error - error from Axios
     * @return user-friendly reason for the error
     */
    getErrorReason(error: unknown): string {
        if (this._isAxiosError(error)) {
            if (error.response) {
                const prefix = `HTTP ${error.response.status} ${error.response.statusText}`;
                if (error.response.status === 500) {
                    return prefix + " -- probably a bug on our end.";
                } else if (isApiErrorPayload(error.response.data)) {
                    return prefix + " -- " + error.response.data.message;
                } else {
                    return prefix;
                }
            } else if (error.request) {
                return "No response from server (it could be down, or you might have lost your internet connection).";
            } // else some problem with setting up the request.
            // Probably a bug, so we can't really return a user-friendly reason.
        }

        console.error(error);

        let reason = "Unknown reason."
        if (process.env.REACT_APP_DEBUG_MODE === "true") {
            reason += "  [Debug mode message: check the developer's console.]";
        }
        return reason;
    }
}
