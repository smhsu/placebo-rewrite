import React from "react";

export function useTimer(durationSeconds: number) {
    const [timeLeftSeconds, setTimeLeft] = React.useState(durationSeconds);
    const timerID = React.useRef<number | undefined>(undefined);
    const startTimerFlag = React.useRef(false);
    const isTimerRunning = timerID.current !== undefined;

    React.useEffect(() => {
        if (startTimerFlag.current) {
            startTimerFlag.current = false;
            startTimer();
        }
    });

    /**
     * Starts the timer.  Does nothing if the timer is already running.
     */
    function startTimer() {
        if (isTimerRunning) {
            return;
        }

        timerID.current = window.setInterval(() => {
            if (document.visibilityState === "hidden") { // Only count down when the window is visible.
                return;
            }
            setTimeLeft(currentTimeLeft => {
                const nextTimeLeft = currentTimeLeft - 1;
                if (nextTimeLeft <= 0) {
                    pauseTimer();
                }
                return nextTimeLeft;
            });
        }, 1000);
    }

    function startTimerAfterNextUpdate() {
        startTimerFlag.current = true;
    }

    /**
     * Pauses the timer.  Does nothing if the timer is already paused.
     */
    function pauseTimer() {
        window.clearInterval(timerID.current);
        timerID.current = undefined;
    }

    React.useEffect(() => pauseTimer, []); // Stop timer on unmount

    return {
        timeLeftSeconds,
        startTimer,
        startTimerAfterNextUpdate,
        pauseTimer,
        isTimerRunning
    };
}
