import DatabaseManager from "./DatabaseManager.js";
import { parseHeader } from "./Parser.js";
import DbData, { dbDataEmpty } from "./types/DbData.js";
import ParsedHeader from "./types/ParsedHeader";

class Database {

    // private header: ParsedHeader
    private name: string 

    constructor( name: string ){

        this.name = name
        // this.header = parseHeader( header )

        // DatabaseManager.

    }

    public getDefs(){
                
    }

}


export default Database