import path from "path"
import DbData, { dbDataEmpty } from "./types/DbData.js"
import { getDir } from "./Utils.js"
import fs, { promises } from 'fs'
import { DatabaseArchive, DatabaseConfig } from "./types/databaseConfig.js"
import ParsedHeader, { batchInfoEmpty } from "./types/ParsedHeader.js"
import readline from 'readline'
import Database from "./Database.js"
import Def from "./types/DbDefinition.js"
import { defToString, parseDefLine } from "./Parser.js"

class _DatabaseManager {
    
    private static Instance: _DatabaseManager

    public static GetInstance(){

        if( !this.Instance ) {
            this.Instance = new _DatabaseManager()
        }
        
        return this.Instance
    }
    
    public configFileName: string
    

    public databaseRootPath:string = ""

    constructor( ){
        // this.resetData()

        this.configFileName = 'dbConfig.data'

        this.databaseRootPath = _DatabaseManager.GetDatabaseRootPath()

    }

    private newDatabaseConfig( path: string ){
        return {
            path,
            header: batchInfoEmpty()
        } as DatabaseArchive
    }

    private createConfigJson()  {
        return {
            databases: [],
        } as DatabaseConfig
    }

    private prepareDatabaseFiles( configFile:string, databaseFile:string ){
        
        const dbName = path.basename( databaseFile ).replace('database-', '').replace('.db', '')
        const appendData = `${dbName}#!0 []\n`
        
        fs.appendFileSync( configFile, appendData, 'utf8' )

    }

    private genUniqueDatabaseName( databaseRootPath: string, name:string ){
        const createDbPath = (rndGen:string) => path.join( databaseRootPath, `database-${name}#${rndGen}.db` )
        
        let dbFilePath
        do {

            const rndGeneration = crypto.randomUUID()
            dbFilePath = createDbPath( rndGeneration )

        } while ( fs.existsSync( dbFilePath ) )

        return dbFilePath
    }

    public static GetDatabaseRootPath(){
        const dir = getDir()
        
        const lastFolder = '..'

        const databaseRootPath = path.join( dir, lastFolder, 'Database')

        if( !fs.existsSync(databaseRootPath) ) fs.mkdirSync( databaseRootPath, { recursive: true } )
    
        return databaseRootPath
    }

    private async getConfigPath( databaseRootPath?: string ){

        if( !databaseRootPath ) databaseRootPath = this.databaseRootPath

        return path.join( databaseRootPath, this.configFileName)
    }

    public async create( name: string ){
        
        const configFilePath = await this.getConfigPath( this.databaseRootPath )

        if( !fs.existsSync(configFilePath) ) await fs.writeFileSync( configFilePath, "", 'utf8')
        
        const dbFilePath = this.genUniqueDatabaseName( this.databaseRootPath, name )
        
        await fs.writeFileSync( dbFilePath, "", 'utf8') 

        this.prepareDatabaseFiles( configFilePath, dbFilePath )

    }

    public async findDatabaseInConfigs ( id:string ) : Promise<string|undefined>{
        const configFilePath = await this.getConfigPath()
        let db:string | undefined = undefined

        await this.readLineByLine( configFilePath, async line => {
            const isSameLine = line.includes(id)
            
            if( isSameLine ){
                db = line
                return true
            }
        })

        return db

    }

    public async readConfig(){}

    private readLineByLine = async ( filePath: string, callback: (line:string) => Promise<boolean | void> ) => {
        const fileStream = fs.createReadStream( filePath, 'utf8' )
        
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        })

        for await (const line of rl ){
            if( !line.trim() ) continue 

            const exitLoop = await callback( line )

            if( exitLoop ) return
        }
    }

    //------------------------- Database Manipulation -------------------------\\

    private getDatabaseById = async ( id: string ) => {

        const dbData = await this.findDatabaseInConfigs( id )

        if( !dbData ) {
            console.error(`Non-existent database: ${id}`)
            return
        }
        
        const db = new Database( id )

        return db
    }

    private getDatabaseName = ( id: string ) => {
        const hashIndex = id.indexOf('#') 
        
        const name = id.substring( 0, hashIndex )

        return name
    }

    private databaseWrite = ( id: string, data: string ) => {

    }

    private getDefs = async ( filePath: string, json: boolean|undefined = false ) => {
        const endDefs = '[END_DEFS]'

        let data = ''

        await this.readLineByLine( filePath, async line => {

            const hasEndDef = line.includes( endDefs )

            if( hasEndDef ) return true 

            data += line + '\n'

        })

        if( json ){

            const defs = data.split('\n').map( i => {
                if( !i.trim() ) return
                return parseDefLine(i)
            }).filter( i => !!i )

            return defs

        }

        return data
    }

    public getFilePath = ( id:string ) => {
        const dbFile = `database-${id}.db`
        const dbPath = path.join( this.databaseRootPath, dbFile )
        return dbPath
    }

    private createDef = async ( id: string, def: Def ) => {
        const filepath = this.getFilePath( id )

        if( !fs.existsSync( filepath )) {
            console.error(`The file does not exist ${filepath}`)
            return
        }

        const defs = await this.getDefs( filepath, true ) as Def[]

        defs.push( def )

        const defsString = defToString( defs )
        
        

        return defs

    }
  
    database = {
        getName: this.getDatabaseName,
        write: this.databaseWrite,
        getById: this.getDatabaseById,
        getFilePath: this.getFilePath,
        createDef: this.createDef,
        getDefs: this.getDefs
    }

}




const DatabaseManager = _DatabaseManager.GetInstance()

export default DatabaseManager
/*
    // database-x-xyz.db
    def x = .x
    def y = .y
    def z = .z
    {}
    #0 @nome / -test "teste"
*/