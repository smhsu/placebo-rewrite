import React from "react";
import { Modal } from "@material-ui/core";
import "./InstructionsModal.css";

interface InstructionsModalProps {
    viewingDuration: number;
    open: boolean;
    onClose: () => void;
}

export function InstructionsModal(props: InstructionsModalProps) {
    const { viewingDuration, open, onClose } = props;
    return <Modal className="InstructionsModal" open={open} onClose={onClose}>
        <div className="InstructionsModal-inner">
            <p className="InstructionsModal-heading">Welcome!</p>
            <p>Simply browse the feed at your leisure.  We'll stop you
                automatically after {viewingDuration} seconds.</p>
            <button className="btn btn-primary" onClick={onClose}>OK</button>
        </div>
    </Modal>;
}
