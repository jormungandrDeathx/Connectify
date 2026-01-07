import CryptoJs from "crypto-js"

const SECRET_KEY = import.meta.env.VITE_CHAT_ENCRYPTION_KEY

export function encryptMessage(text){
    return CryptoJs.AES.encrypt(text, SECRET_KEY).toString()
}

export function decryptMessage(cipherText){
    try{
        const bytes = CryptoJs.AES.decrypt(cipherText, SECRET_KEY)
        return bytes.toString(CryptoJs.enc.Utf8)
    }catch{
        return "[unable to decrypt]"
    }
}