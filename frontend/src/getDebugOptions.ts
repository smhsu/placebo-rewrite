export function getDebugOptions(optionName: string): string | null {
    if (process.env.REACT_APP_USE_DEBUG_QUERY_PARAMS !== "true") {
        return null;
    } else {
        const params = new URLSearchParams(window.location.search);
        return params.get(optionName);
    }
}
