import React from "react";

import "./SliderContainer.css";

export interface SliderContainerProps {
    mainLabel: string;
    instructions?: string;
    mainLabelFor?: string;
    lowLabel?: string;
    highLabel?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export function SliderContainer(props: React.PropsWithChildren<SliderContainerProps>): React.ReactElement {
    const { mainLabel, instructions, mainLabelFor, lowLabel, highLabel, disabled, onClick } = props;
    const disabledCss = disabled ? " SliderContainer-disabled" : "";
    return <div onClick={onClick}>
        <label htmlFor={mainLabelFor} className="SliderContainer-main-label">
            {mainLabel}
        </label>
        <div className="SliderContainer-instructions">
            {instructions || "Move the slider to customize Tweets."}
        </div>
        <div className="SliderContainer-labeled-track">
            <div className={"SliderContainer-low-label" + disabledCss}>
                {lowLabel}
            </div>
            {props.children}
            <div className={"SliderContainer-high-label" + disabledCss}>
                {highLabel}
            </div>
        </div>
    </div>;
}
