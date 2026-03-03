import BatchInfo from "./BatchInfo"

export default interface ParsedHeader {
    maxId: number
    batches: BatchInfo[]
}

export function batchInfoEmpty() : ParsedHeader {
    return {
        maxId: 0,
        batches: []
    }
} 