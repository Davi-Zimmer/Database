import { archive } from "./archive.js";
import { parseDefLine, parseFlags, parseHeader, parseInput, parseItemLine, writeHeader } from "./Parser.js";
/*
    const line = 'def value test'
    const def = parseDefLine( line )
    console.log( def )
    
    // const line = '-t 123456 -d "tatp"'
    const line = '-d dados -conn #0 -sozinha'
    const flags = parseFlags( line )
    console.log( flags )
    
    const line = "#10 .foo.bar @nome / -d dados -c #0"
    const node = parseItemLine( line )
    console.log( node )
    

    */
   const obs = parseInput( archive )
   
   console.log( obs )

/*
const data = `
    !0 [125000$0-5,7,9-10;250000$100-140;]
`

const a = parseHeader( data )

console.log( writeHeader( a ) )
*/