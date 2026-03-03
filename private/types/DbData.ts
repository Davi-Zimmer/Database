import Def from "./DbDefinition";
import Node from "./Node";
import ParsedHeader, { batchInfoEmpty } from "./ParsedHeader.js"

export default interface DbData {
    defs: Def[],
    items: Node[],
    header: ParsedHeader
}

export function dbDataEmpty(): DbData {
    return {
        defs: [],
        items: [],
        header: batchInfoEmpty()
    }
}