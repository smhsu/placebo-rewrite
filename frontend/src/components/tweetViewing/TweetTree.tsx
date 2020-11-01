import React, {forwardRef, memo} from "react";
import { AugmentedTweet } from "../../AugmentedTweet";
import { Tweet } from "./Tweet";
import FlipMove from 'react-flip-move';
import {ITweetFilterDataConfig} from "../tweetFilters/ITweetFilter";

export interface TweetTreeNode {
    tweet: AugmentedTweet;
    children: TweetTreeNode[];
}

/**
 * 
 * @param tweets 
 * @return list of root nodes in no particular order
 */
export function buildTweetTrees(tweets: AugmentedTweet[]): TweetTreeNode[] {
    const rootNodes = [];
    const treeNodeForId = new Map<string, TweetTreeNode>();
    for (const tweet of tweets) {
        const thread: TweetTreeNode = { tweet, children: [] };
        treeNodeForId.set(tweet.id_str, thread);
    }

    for (const node of treeNodeForId.values()) {
        const parentTweetId = node.tweet.in_reply_to_status_id_str || "";
        const parentNode = treeNodeForId.get(parentTweetId);
        if (parentNode) {
            parentNode.children.push(node);
        } else {
            rootNodes.push(node); // Has no parent?  Then you must be top-level.
        }
    }

    return rootNodes;
}

const TweetTreeDisplay = forwardRef<HTMLDivElement, {node: TweetTreeNode}>((props, ref) => {
    const node = props.node;
    return <div ref={ref}>
        <Tweet tweet={node.tweet} hasRepliesUnder={node.children.length > 0} />
        {node.children.map(childNode => <TweetTreeDisplay key={childNode.tweet.id_str} node={childNode}/>)}
    </div>;
});

export const TweetTree = memo(({tweets, config}: {tweets: AugmentedTweet[], config: ITweetFilterDataConfig | null}) => {
    const rootNodes = buildTweetTrees(tweets);
    let sortedRootNodes = rootNodes.sort((n1, n2) => n2.tweet.created_at_unix - n1.tweet.created_at_unix);
    if (config?.shouldFlip && config.shouldAnimate) {
        const [first, second, ...rest] = sortedRootNodes;
        sortedRootNodes = [second, first, ...rest];
    }
    const shouldAnimate = config === null ? false : config.shouldAnimate;
    return <FlipMove enterAnimation={false} disableAllAnimations={!shouldAnimate}>
        {sortedRootNodes.map(rootNode => <TweetTreeDisplay key={rootNode.tweet.id_str} node={rootNode} />)}
    </FlipMove>
});