import { archive } from "./archive.js";
import Database from "./Database.js";
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
    

    const obs = parseInput( archive )
    console.log( obs )
    */
   

/*
const data = `
    !0 [125000$0-5,7,9-10;250000$100-140;]
`

const a = parseHeader( data )

console.log( writeHeader( a ) )
*/

/*
!24 [15000$0-3,5,7-22;21000$23-24,26-29]

def arm .arm
def head .eyes.hair.mouth
def person .person.*head.*arm
def branch .branch

#0 .*person @Julio / -age 24 -role manager
#1 .*branch @empresaA / -owner *#0


.arm.eyes.hair.mouth.person

*/

/*
const a = new Database()

console.log( a.data.defs )
*/
/*
const line = '!24 100 200 [15000$0-3,5,7-22;21000$23-24,26-29]'
console.log( parseHeader( line ))
*/

new Database().create()