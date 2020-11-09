import React from "react";
import {ImgWithFallback} from "./ImgWithFallback";
import {DEFAULT_PROFILE_PICTURE_URL} from "../../tweetUtils";

interface TweetsCollapsedIndicatorProps {
    profileImage: string;
    tweetsLeft: number;

    onExpand(): void;
}

export const TweetsCollapsedIndicator = React.memo(function TweetsCollapsedIndicator(props: TweetsCollapsedIndicatorProps) {
    const {profileImage, tweetsLeft, onExpand} = props;
    return <div className="Tweet-outer Tweet-bottom-border">
        <div className="Tweet-inner Tweet-inner-thread-minimized">
            <div className="Tweet-profile Tweet-profile-thread-minimized">
                <ImgWithFallback
                    className="img-fluid rounded-circle"
                    src={profileImage}
                    fallbackSrc={DEFAULT_PROFILE_PICTURE_URL}
                    alt="User profile"
                />
            </div>
            <button
                type="button"
                className="btn btn-link"
                onClick={onExpand}
            >
                Show {tweetsLeft} more tweets in this thread
            </button>
        </div>
    </div>
});