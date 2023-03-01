import React from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CopyButtonProps {
    copyString: string;
}

export function CopyButton(props: CopyButtonProps) {
    const [isCopied, setIsCopied] = React.useState(false);
    const handleCopyPressed = React.useCallback(() => {
        navigator.clipboard.writeText(props.copyString || "")
            .then(() => setIsCopied(true));
    }, [props.copyString]);

    const style = {
        border: "1px solid lightgrey",
        color: isCopied ? "green" : "black"
    };

    return <button className="btn btn-light" style={style} onClick={handleCopyPressed}>
        {isCopied ?
            <><FontAwesomeIcon icon={faCheck} /> Copied!</>
            :
            "Copy"
        }
    </button>;
}
