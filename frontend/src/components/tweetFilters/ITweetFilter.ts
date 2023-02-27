import React from "react";
import { TweetThread } from "../../tweetModels/TweetThread";

/**
 * Configuration for rendering settings that filter and/or reorder tweets.
 */
export interface ITweetFilter<S> {
    /** Initial state of the setting. */
    initialState: S;

    /** Controlled component that renders a user-facing setting, or null to render no setting. */
    SettingComponent: React.ComponentType<SettingComponentProps<S>> | null;

    /** Function that filters or reorders tweets based on the current state of the setting. */
    doFilter(threads: TweetThread[], currentState: S): TweetThread[];

    /** Whether changes to tweets or tweet order should trigger an animation. */
    shouldAnimateChanges: boolean;
}

export interface SettingComponentProps<S> {
    /** Current state of the setting. */
    currentState: S;

    /** Callback for updating the setting's state. */
    onStateUpdated(newState: S): void;

    onClick(): void;

    /** Called when the setting requests the number of displayed threads to be reset. */
    onResetFeedSize(): void;
}
