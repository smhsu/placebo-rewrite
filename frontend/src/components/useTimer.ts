import React from "react";

export function useTimer(durationSeconds: number) {
    const [timeLeftSeconds, setTimeLeft] = React.useState(durationSeconds);
    const timerID = React.useRef<number | undefined>(undefined);

    function startTimer() {
        stopTimer(); // Ensure only one setInterval runs at a time.
        timerID.current = window.setInterval(() => {
            setTimeLeft(currentTimeLeft => {
                const nextTimeLeft = currentTimeLeft - 1;
                if (nextTimeLeft <= 0) {
                    stopTimer();
                }
                return nextTimeLeft;
            });
        }, 1000);
    }

    function stopTimer() {
        window.clearInterval(timerID.current);
        timerID.current = undefined;
    }

    React.useEffect(() => stopTimer, []); // Stop timer on unmount

    return {
        timeLeftSeconds,
        startTimer,
        stopTimer,
        isTimerRunning: timerID !== undefined
    };
}
