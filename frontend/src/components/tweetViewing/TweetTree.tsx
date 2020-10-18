import React from "react";
import { TimeParsedTweet } from "../../TimeParsedTweet";
import { Tweet } from "./Tweet";

export interface TweetTreeNode {
    tweet: TimeParsedTweet;
    children: TweetTreeNode[];
}

/**
 * 
 * @param tweets 
 * @return list of root nodes in no particular order
 */
export function buildTweetTrees(tweets: TimeParsedTweet[]): TweetTreeNode[] {
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

export function TweetTreeDisplay(props: {node: TweetTreeNode}) {
    const node = props.node;
    return <>
        <Tweet tweet={node.tweet} hasRepliesUnder={node.children.length > 0} />
        {node.children.map(childNode => <TweetTreeDisplay key={childNode.tweet.id_str} node={childNode}/>)}
    </>;
};
