import crypto from 'crypto'

function encrypt( plaintext, key ) {
    const iv = crypto.randomBytes(12);  // cria IV aleatório
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext),
        cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Salva: [IV][TAG][Encrypted]
    return Buffer.concat([iv, tag, encrypted]);
}

function decrypt( data, key ){
    const iv = data.slice(0, 12) // 12 bytes
    const tag = data.slice(12, 28)
    const encrypted = data.slice(28)
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv )
    
    decipher.setAuthTag( tag )

    const decrypted = Buffer.concat([
        decipher.update( encrypted ),
        decipher.final()
    ])

    return decrypted
}

const password = 'segredo'
const key = crypto.createHash('sha256').update( password ).digest()

const encryptData = Buffer.from('Hello, World!')
const encripted = encrypt( encryptData, key )

console.log( encripted )

const data = Buffer.from(encripted, 'hex')
const dec = decrypt( data, key )

console.log( dec.toString() )
