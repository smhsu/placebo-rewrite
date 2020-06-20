import React from "react";

import "./SliderContainer.css";

export interface SliderContainerProps {
    mainLabel: string;
    mainLabelFor?: string;
    lowLabel?: string;
    highLabel?: string;
}

export function SliderContainer(props: React.PropsWithChildren<SliderContainerProps>): React.ReactElement {
    return <div>
        <label htmlFor={props.mainLabelFor}>{props.mainLabel}</label>
        <div className="SliderContainer-labeled-track">
            <div className="SliderContainer-low-label">{props.lowLabel}</div>
            {props.children}
            <div className="SliderContainer-high-label">{props.highLabel}</div>
        </div>
    </div>;
}
