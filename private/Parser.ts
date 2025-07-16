import BatchInfo from "./types/BatchInfo.js"
import DbData from "./types/DbData.js"
import Def from "./types/DbDefinition.js"
import DbFlags from "./types/DbFlags.js"
import IDRange from "./types/IDRange.js"
import Node from "./types/Node.js"
import ParsedHeader from "./types/ParsedHeader.js"

export function parseLines( input: string ){
    return  (
        input
        .split(/\r?\n/)
        .map( line => line.trim() )
        .filter( line => line.length > 0 )
    )
}

const validations = {
    def: (name:string, value:string, line:string ) => {
        if( !name ) throw Error(`Undefined definition name: ${line}`)
        if( !value ) throw Error(`Undefined definition value: ${line}`)
        if( !['@', '*', '.', '#'].includes( value[0] ) ) throw Error(`Invalid definition value (must start with ".", "#", "@" or "*")`)
    }

}

export function parseDefLine( line: string ) : Def {

    if( !line.startsWith('def ') ) throw Error(`Invalid Line for definition: ${line}`)

    const rest = line.slice( 4 ).trim()

    const spaceIndex = rest.indexOf(" ")
    
    if( spaceIndex === -1 ) throw Error(`Incomplete definition (expected name and value): ${line}`)

    const name = rest.slice( 0, spaceIndex ).trim()

    const value = rest.slice( spaceIndex + 1 ).trim()

    validations.def( name, value, line )

    return { name, value }

}

export function parseFlags( flags: string ) : DbFlags[] {

    const result: DbFlags[] = []

    if( !flags ) return result

    const tokens = tokenizeFlags( flags.trim() )

    let i = 0

    while( i < tokens.length ) {
        const token = tokens[ i ]

        if( !token.startsWith("-") ) throw Error(`Invalid flag (must start with "-"): ${token}`)

        let flag: DbFlags = { key: token }

        const index = i + 1

        if( index < tokens.length  && !tokens[ index ].startsWith("-") ){

            flag.value = tokens[ index ]

            i += 2

        } else {

            i += 1

        }

        result.push( flag )
    }
    
    return result
}

export function parseItemLine( line: string ) : Node {

    const [ metaPart, flagsPart ] = line.split( '/', 2 ).map( part => part?.trim() || "")

    if( !metaPart.startsWith('#') ) throw Error(`Invalid item line (missing id): ${line}`)

    const tokens = metaPart.split(/\s+/)

    if( tokens.length < 1 ) throw Error(`Invalid item line (empty): ${line}`)
    
    // ID
    const idToken = tokens[ 0 ]
    
    const idStr = idToken.slice( 1 )

    const id = parseInt( idStr, 10 )

    if( isNaN( id ) ) throw Error(`Invalid ID (must be a number): ${line}`)


    const classes: string[] = []
    
    let name: string | undefined = undefined
    

    for(let i = 1; i < tokens.length; i++){
        const token = tokens[ i ]

        switch( token[0] ){
            case ".": {
                const parts = token.slice( 1 ).split('.')
                
                for( let part of parts ){
                    
                    if( !part ) continue

                    if( classes.includes( part )) throw Error(`Duplicate class ${part} in line: ${line}`)

                    classes.push( part )

                }
                break
            }

            case "@": {

                if( name ) throw Error(`Multiple names found in line: ${line}`)


                name = token.slice( 1 )

                if( !name ) throw Error(`Empty name in line: ${line}`)
                    
                break
            }

            default: throw Error(`Unknown token in item line: ${line}`)
        }

    }

    const flags = parseFlags( flagsPart )
    
    const node = { id, classes, name, flags, line }
    
    return node
}

export function parseInput( input: string ) : DbData {
    const defs: Def[] = []
    const items: Node[] = []
    // let header: ParsedHeader | undefined = undefined
    
    const lines = parseLines( input )

    for( const line of lines ){
        // if( line.startsWith('!')) {
        //     if( header ) throw Error(`Multiple headers found. Only one is allowed.`)
        //     header = parseHeader( line )
        // } else 
        if( line.startsWith('def ') ) defs.push( parseDefLine( line ) ); else
        if( line.startsWith('#') ) items.push( parseItemLine( line ) ); else 
        throw Error(`Unknown line type: ${line}`)
    }

    const defNames = new Set<string>()
    for( const d of defs ){
        if( defNames.has( d.name ) ) throw Error(`Duplicate definition name: ${d.name}`)
     
        defNames.add( d.name )
    }

    const ids = new Set<number>()
    for( const item of items ){
        if( ids.has( item.id ) ) throw Error(`Duplicate item id: ${item.id}`)

        ids.add( item.id )
    }

    // if( !header ) throw Error(`Undefined header`)

    return { items, defs }

}

export function tokenizeFlags( input: string ){
    const tokens: string[] = []
    
    let current = ''
    let inQuotes = false

    for( let i = 0; i < input.length; i++ ){
        const char = input[ i ]

        if( inQuotes ){

            if( char === '\\'){
                i++
                
                if( i < input.length ) current += input[ i ]
                
            }

            else if( char === '"')  inQuotes = false
            else current += char

        } else {

            if( char === '"' ) inQuotes = true
            else if( /\s/.test( char ) ) {

                if( current.length > 0) {
                    tokens.push( current )
                    current = ''
                }

            } else {
                current += char
            }
            
        }

    }


    if( inQuotes ) throw Error(`Unclosed string literal in flags`)

    if( current.length > 0 ) tokens.push( current )
    
    return tokens

}

export function parseHeader( headerText: string ){

    headerText = headerText.trim()
    
    if( !headerText.startsWith("!") ) throw Error(`'Header must start with "!" indicating maxId.'`)

    const exclMark = headerText.indexOf("!")

    const spaceAfterExcl = headerText.indexOf( ' ', exclMark )

    if( spaceAfterExcl === -1 ) throw Error(`Missing header list.`)

    const maxIdStr = headerText.slice( exclMark + 1, spaceAfterExcl ).trim()
    /*
    const [ start, end ] = headerText.split(/\s+/).filter( (_, i) => (i == 1 || i == 2) ).map( item => {
        const n = parseInt( item )
    
        if( !isNaN( n ) ) return n

        throw Error(`Invalid offset: ${item}`)
    })

    if( !start || !end ) throw Error(`Missing offset`)
    */
    const maxId = parseInt( maxIdStr, 10 )
    
    if( isNaN( maxId ) ) throw Error(`Invalid maxId: ${maxId}`)

    const startBracket = headerText.indexOf( '[' , spaceAfterExcl )
    const endBracket = headerText.indexOf( ']' , spaceAfterExcl )

    if( startBracket === -1 || endBracket === -1 ) throw Error(`Missing "[" or "]" in header`)  

    const innerContent = headerText.slice( startBracket + 1, endBracket ).trim()

    if( !innerContent ) return { maxId, batches: [] }

    const batchStrings = (
        innerContent
        .split(';')
        .map( b => b.trim() )
        .filter( b => b.length > 0 )
    )

    const batches: BatchInfo[] = []

    for( const batchStr of batchStrings ){

        const dollarIndex = batchStr.indexOf("$")
    
        if( dollarIndex === -1 ) throw Error(`Invalid batch format (missing $): ${batchStr}`)
    
        const offsetStr = batchStr.slice( 0, dollarIndex ).trim()

        const offset = parseInt( offsetStr )

        if( isNaN( offset ) ) throw Error(`Invalid offset: ${offset}`)
    
        const rangesPart = batchStr.slice( dollarIndex + 1 ).trim()

        if( !rangesPart ) throw Error(`Batch with no ID ranges: ${batchStr}`)

        const ids: IDRange[] = []

        const rangeTokens = rangesPart.split(',').map( r => r.trim() ).filter( r => r.length > 0)
        
        for( const token of rangeTokens ){

            if( token.includes("-") ){

                const [ fromStr, toStr ] = token.split("-").map( s => s.trim() )
                
                const from = parseInt( fromStr )
                const to = parseInt( toStr )

                if( isNaN( from + to ) ) throw Error(`Invalid range ${token}`)

                ids.push({ from, to })

            } else {

                const single = parseInt( token, 10 )

                if( isNaN( single ) ) throw Error(`Invalid ID ${token}`)

                ids.push({ from: single, to: single })
            }

        }

        batches.push({ offset, ids })

    }

    return { maxId, batches }

}

export function writeHeader( data: ParsedHeader ){

    const { maxId, batches } = data

    if( maxId < 0 || !Number.isInteger( maxId ) ) throw Error(`Invalid maxId: ${maxId}`)

    const batchStrings: string[] = batches.map( batch => {
        
        if( batch.offset < 0 || !Number.isInteger( batch.offset ) ) throw Error(`Invalid offset in batch ${batch.offset}`)
            
        const idString = batch.ids.map( range => {
            if( range.from === range.to ) return `${range.from}`
            else return `${range.from}-${range.to}` 

        })
            
        return `${batch.offset}$${idString.join(",")}`
    })

    const joined = batchStrings.length > 0 ? batchStrings.join(";") + ";" : ""

    return `!${maxId} [${joined}]`
}

export function defToString( defs:Def[] ){
    
    const defsString = new Set<string>()

    defs.forEach( def => {
        
        const definition = `def ${def.name} ${def.name}`

        parseDefLine( definition )

        if( defsString.has( definition ) ) throw Error(`Duplicate definition name: ${def.name}`)

        defsString.add( definition )
        
    })

    return [...defsString]

}