export const METHOD = 'GET'
export const PATH = '/api/request_assignment'

export enum GroupAssigment {
    CONTROL, EXPERIMENTAL
}
export interface ResponsePayload {
    readonly assignment: GroupAssigment,
}