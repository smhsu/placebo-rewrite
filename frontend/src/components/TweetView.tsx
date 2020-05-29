import React from "react";
import { Settings } from "./Settings";

export class TweetView extends React.Component {
    render() {
        const tweets = [];
        for (let i = 0; i < 20; i++) {
            tweets.push(<div key={i} style={{minHeight: 150, border: "1px solid lightgrey", padding: 10}}>
                <img src="https://via.placeholder.com/50" alt="profile"/>
                <p>
                Tweet.  This text is about 160 characters, which is a random guess of how much space an average Tweet
                will take up.  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </p>
            </div>);
        }

        return <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col" style={{maxWidth: 600, padding: 0}}>
                    {tweets}
                </div>
                <div className="col col-sm-5 col-md-4 col-xl-3">
                    <Settings />
                </div>
            </div>
        </div>;
    }
}