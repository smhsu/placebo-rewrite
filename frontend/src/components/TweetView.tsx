import React from "react";
import { Settings } from "./Settings";
import { Status } from "twitter-d";
import { Tweet } from "./Tweet";

interface Props {
    tweets: Status[];
}

export class TweetView extends React.Component<Props> {
    render() {
        return <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col" style={{maxWidth: 600, padding: 0}}>
                    {this.props.tweets.map(tweet => <Tweet key={tweet.id} tweet={tweet} />)}
                </div>
                <div className="col col-sm-5 col-md-4 col-xl-3">
                    <Settings />
                </div>
            </div>
        </div>;
    }
}
