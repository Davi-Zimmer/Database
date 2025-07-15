import path from "path"
import DbData, { dbDataEmpty } from "./types/DbData.js"
import { getDir } from "./Utils.js"
import fs, { promises } from 'fs'
import { DatabaseArchive, DatabaseConfig } from "./types/databaseConfig.js"
import ParsedHeader, { batchInfoEmpty } from "./types/ParsedHeader.js"

class Database {
    public data: DbData = {} as DbData

    constructor(){
        this.resetData()
    }

    resetData(){
        
        this.data = dbDataEmpty()

        return this.data

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

        const dataString = fs.readFileSync(configFile, 'utf8')
        
        let data: DatabaseConfig
        if (!dataString.trim()) data = this.createConfigJson()
        else  data = JSON.parse(dataString) as DatabaseConfig

        const newItem = this.newDatabaseConfig( databaseFile, )

        data.databases.push( newItem )

        const newDataString = JSON.stringify( data, null, 2 )

        fs.writeFileSync( configFile, newDataString )
    }

    private genUniqueDatabaseName( databaseRootPath: string ){
        const createDbPath = (rndGen:string) => path.join( databaseRootPath, `database-${rndGen}.db` )
        
        let dbFilePath
        do {

            const rndGeneration = crypto.randomUUID()
            dbFilePath = createDbPath( rndGeneration )

        } while ( fs.existsSync( dbFilePath ) )

        return dbFilePath
    }

    private async getDatabaseRootPath(){
        const dir = getDir()
        
        const lastFolder = '..'

        const databaseRootPath = path.join( dir, lastFolder, 'Database')

        if( !fs.existsSync(databaseRootPath) ){
            await promises.mkdir( databaseRootPath, { recursive: true } )
        }

        return databaseRootPath
    }

    public async create(){
        
        const databaseRootPath = await this.getDatabaseRootPath()

        const configFilePath = path.join( databaseRootPath, 'dbConfig.data')

        if( !fs.existsSync(configFilePath) ) await fs.writeFileSync( configFilePath, "", 'utf8')
        
        const dbFilePath = this.genUniqueDatabaseName( databaseRootPath )
        
        await fs.writeFileSync( dbFilePath, "", 'utf8') 

        this.prepareDatabaseFiles( configFilePath, dbFilePath )

    }

    public async readConfig(){
        
        const databaseRootPath = await this.getDatabaseRootPath()


    }
}

export default Database