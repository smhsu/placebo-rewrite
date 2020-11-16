import React from "react";
import { AugmentedTweet } from "../../AugmentedTweet";
import { TweetThread } from "../../TweetThread";

/**
 * Configuration for rendering settings that filter and/or reorder tweets.
 */
export interface ITweetFilter<S> {
    /** Initial state of the setting. */
    initialState: S;

    /** Controlled component that renders a user-facing setting, or null to render no setting. */
    SettingComponent: React.ComponentType<SettingComponentProps<S>> | null;

    /** Function that filters or reorders tweets based on the current state of the setting. */
    doFilter(tweets: AugmentedTweet[], currentState: S): TweetThread[];

    /** Whether changes to tweets or tweet order should trigger an animation. */
    shouldAnimateTweetChanges: boolean;
}

export interface SettingComponentProps<S> {
    /** Current state of the setting. */
    currentState: S;

    /** Callback for updating the setting's state. */
    onStateUpdated(newState: S): void;
}
