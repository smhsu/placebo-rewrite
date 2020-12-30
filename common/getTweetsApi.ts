import { Status } from "twitter-d";
import { UserAuthToken } from "./UserAuthToken";

export const METHOD = "POST";
export const PATH = "/api/tweets";
export type RequestQueryParams = UserAuthToken;
export interface ResponsePayload {
    tweets: Status[];
}
