import React from "react";

import "./Settings.css";

export class Settings extends React.Component {
    render() {
        return <div className="Settings">
            <h4>Settings</h4>
            <div className="row">
                <label className="col-auto">Popularity</label>
                <div className="col">
                    <input type="range" />
                </div>
            </div>
        </div>;
    }
}
