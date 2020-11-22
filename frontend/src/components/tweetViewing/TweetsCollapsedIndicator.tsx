import React from "react";
import { ImgWithFallback } from "./ImgWithFallback";
import { DEFAULT_PROFILE_PICTURE_URL } from "../../tweetUtils";

import "./Tweet.css";

interface TweetsCollapsedIndicatorProps {
    profileImageSrc: string;
    numTweetsHidden: number;
    onExpand(): void;
}

export const TweetsCollapsedIndicator = React.memo(function TweetsCollapsedIndicator(props: TweetsCollapsedIndicatorProps) {
    const {profileImageSrc, numTweetsHidden, onExpand} = props;
    const useSingular = numTweetsHidden === 1;
    return <div className="Tweet-outer Tweet-bottom-border">
        <div className="Tweet-inner Tweet-inner-thread-minimized">
            <div className="Tweet-profile Tweet-profile-thread-minimized">
                <ImgWithFallback
                    className="img-fluid rounded-circle"
                    src={profileImageSrc}
                    fallbackSrc={DEFAULT_PROFILE_PICTURE_URL}
                    alt="User profile"
                />
            </div>
            <button className="btn btn-link" onClick={onExpand}>
                Show {numTweetsHidden} more {useSingular ? "tweet" : "tweets"} in this thread
            </button>
        </div>
    </div>;
});
