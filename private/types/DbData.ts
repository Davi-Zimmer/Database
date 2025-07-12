import Def from "./DbDefinition";
import Node from "./Node";
import ParsedHeader from "./ParsedHeader";

export default interface DbData {
    defs: Def[],
    items: Node[],
    header: ParsedHeader
}