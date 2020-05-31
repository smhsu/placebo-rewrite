export const METHOD = 'POST'
export const PATH = '/api/store_submission'

export interface RequestPayload {
    data: any
}
export interface ResponsePayload {
    mongoDBId: string
}
