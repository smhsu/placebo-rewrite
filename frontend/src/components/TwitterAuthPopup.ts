import axios from "axios";
import * as RequestTokenApi from "../common/requestTokenApi";
import * as GetTweetsApi from "../common/getTweetsApi";
import querystring from "querystring";

const TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate";
const POLLING_INTERVAL_MS = 250;

export class TwitterAuthPopup {
    private _popup: Window | null = null;
    private _pollingID?: number = undefined;

    get isOpen() {
        return this._popup !== null && this._popup.closed !== undefined && !this._popup.closed;
    }

    close() {
        window.clearInterval(this._pollingID);
        if (this.isOpen && this._popup) {
            this._popup.close();
            this._popup = null;
        }
    }

    async openAndWaitForAuthToken(width=500, height=400): Promise<GetTweetsApi.RequestQueryParams> {
        this._open(width, height);

        return new Promise<GetTweetsApi.RequestQueryParams>((resolve, reject) => {
            this._setLocationToTwitter()
                .catch(error => {
                    this.close();
                    reject(error);
                });

            // We have to constantly poll the window for changes in its state.
            this._pollingID = window.setInterval(() => {
                if (!this.isOpen || !this._popup) {
                    window.clearInterval(this._pollingID);
                    reject(new PermissionDeniedError("Popup closed by user"));
                    return;
                }

                let hostname = "";
                try {
                    hostname = this._popup.location.hostname;
                } catch (error) {
                    if (error instanceof DOMException) {
                        // Prohibited from accessing the location because it's still on Twitter's website, presumably.
                        return;
                    }
                }

                if (hostname.includes(window.location.hostname)) { // Twitter auth window navigated us back
                    // substring(1) cuts off the "?" in the URL query string
                    const queryParams = querystring.parse(this._popup.location.search.substring(1));
                    const fetchParams = GetTweetsApi.extractQueryParams(queryParams);
                    if (fetchParams) {
                        resolve(fetchParams);
                    } else {
                        reject(new PermissionDeniedError("User denied permission"));
                    }
                    this.close();
                }
            }, POLLING_INTERVAL_MS);
        });
    }

    private _open(width: number, height: number) {
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            "",
            "",
            "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, " +
            `copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
        );
        if (!popup) {
            throw new PopupBlockedError("Popup blocked");
        }
        this._popup = popup;
    }

    private async _setLocationToTwitter() {
        if (!this._popup) {
            return;
        }
        const loadingMessage = this._popup.document.body.appendChild(this._popup.document.createElement("p"));
        loadingMessage.innerText = "Awaiting response from Twitter API...";
        const response = await axios.request<RequestTokenApi.ResponsePayload>({
            method: RequestTokenApi.METHOD,
            url: RequestTokenApi.PATH,
        });
        this._popup.location.href = TWITTER_AUTH_URL + "?oauth_token=" + response.data.oauth_token;
    }
}

/** Happens when the popup couldn't open for some reason */
export class PopupBlockedError extends Error {}

/** Happens when the user closes the popup, or denies permission inside the popup. */
export class PermissionDeniedError extends Error {}
