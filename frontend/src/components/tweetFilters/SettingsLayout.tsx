import React from "react";
import "./SettingsLayout.css";

interface SettingsLayoutProps {
    heading?: React.ReactNode;
}

export function SettingsLayout(props: React.PropsWithChildren<SettingsLayoutProps>) {
    return <div className="SettingsLayout">
        {props.heading || <div className="SettingsLayout-header">Settings</div>}
        <div className="SettingsLayout-content">
            {props.children}
        </div>
    </div>;
}
