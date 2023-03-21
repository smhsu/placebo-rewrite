import React from "react";

import "./SliderContainer.css";

export interface SliderContainerProps {
    mainLabel: string;
    instructions?: string;
    mainLabelFor?: string;
    lowLabel?: string;
    highLabel?: string;
    disabled?: boolean;
}

export function SliderContainer(props: React.PropsWithChildren<SliderContainerProps>): React.ReactElement {
    const { mainLabel, instructions, mainLabelFor, lowLabel, highLabel, disabled } = props;
    return <div>
        <label htmlFor={mainLabelFor} className="SliderContainer-main-label">
            {mainLabel}
        </label>
        <div className="SliderContainer-instructions">
            {instructions || "Move the slider to customize Tweets."}
        </div>
        <div className="SliderContainer-labeled-track">
            <div className={"SliderContainer-low-label" + (disabled ? " SliderContainer-disabled" : "")}>
                {lowLabel}
            </div>
            {props.children}
            <div className={"SliderContainer-high-label" + (disabled ? " SliderContainer-disabled" : "")}>
                {highLabel}
            </div>
        </div>
    </div>;
}
