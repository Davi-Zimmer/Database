import ParsedHeader from "./ParsedHeader"

export interface DatabaseArchive {
    path: string
    header: ParsedHeader
}

export interface DatabaseConfig {
    databases: DatabaseArchive[]
}