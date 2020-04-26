import React from "react";
import TwitterAuth from "react-twitter-auth";
import * as RequestTokenApi from "./common/requestTokenApi";
import * as HandleAccessTokenApi from "./common/handleAccessTokenApi";

export class App extends React.Component {
    async handleSuccess(response: Response) {
        if (response.status !== 200) {
            this.handleLoginError(new Error("Oh no"));
        } else {
            const json = await response.json();
            console.log(json);
        }
    }

    handleLoginError(error: Error) {
        console.log(error);
    }

    render() {
        // If your login flow is not working, look at the gotcha described in the type definition for this component.
        return <TwitterAuth
            requestTokenUrl={RequestTokenApi.PATH}
            loginUrl={HandleAccessTokenApi.PATH}
            onSuccess={this.handleSuccess}
            onFailure={this.handleLoginError}
        />;
    }
}
