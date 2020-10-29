export enum AppState {
    START,
    LOADING,
    LOADED,
    ERROR
}

export enum FailedAction {
    LOGIN = "Login request failed.",
    FETCH = "Couldn't fetch your tweets."
}

export interface ErrorInfo {
    failedAction: FailedAction;
    cause: string;
}
