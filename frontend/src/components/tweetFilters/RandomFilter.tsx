import { ITweetFilter } from "./ITweetFilter";
import { shuffle } from "lodash";

export const randomFilter: ITweetFilter<undefined> = {
    initialState: undefined,
    SettingComponent: null,
    doFilter: shuffle,
    shouldAnimateChanges: false
}
