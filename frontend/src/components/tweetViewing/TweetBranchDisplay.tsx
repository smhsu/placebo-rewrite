import React, { forwardRef, useEffect, useState } from "react";
import { TweetDisplay } from "./TweetDisplay";
import { TweetsCollapsedIndicator } from "./TweetsCollapsedIndicator";
import { TweetThread } from "../../TweetThread";

const TWEETS_COLLAPSE_THRESHOLD = 3;

interface Props {
    branch: TweetThread;
}

export const TweetBranchDisplay = forwardRef<HTMLDivElement, Props>(function TweetBranchDisplay(props, ref) {
    const branch = props.branch;
    const [isShowingFullBranch, setIsShowingFullBranch] = useState(false);
    useEffect(() => {
        setIsShowingFullBranch(false);
    }, [branch]);

    const isCollapsed = branch.length > TWEETS_COLLAPSE_THRESHOLD && !isShowingFullBranch;
    const tweets = isCollapsed ? branch.slice(0, TWEETS_COLLAPSE_THRESHOLD) : branch;
    return <div ref={ref}>
        {tweets.map((tweet, idx) => {
            const isLastTweet = idx + 1 === tweets.length;
            return <TweetDisplay
                key={tweet.id_str}
                tweet={tweet}
                hasRepliesUnder={isLastTweet ? isCollapsed : true}
            />;
        })}
        {isCollapsed && <TweetsCollapsedIndicator
            profileImageSrc={branch[TWEETS_COLLAPSE_THRESHOLD].author.profile_image_url_https}
            numTweetsHidden={branch.length - TWEETS_COLLAPSE_THRESHOLD}
            onExpand={() => setIsShowingFullBranch(true)}
        />}
    </div>;
});
