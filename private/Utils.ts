import { fileURLToPath } from 'url'
import path from 'path'

export function getDir(){
    
    const __filename = fileURLToPath( import.meta.url )
    const __dirname = path.dirname( __filename )

    return __dirname
}