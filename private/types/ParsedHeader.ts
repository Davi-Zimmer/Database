import BatchInfo from "./BatchInfo"

export default interface ParsedHeader {
    maxId: number
    batches: BatchInfo[]
}