import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
const ALGORITHM = "aes-256-gcm"

export function encryptApiKey(apiKey: string): { encryptedKey: string; iv: string; authTag: string } {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

export function decryptApiKey(encryptedKey: string, iv: string, authTag: string): string {
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

export function encryptAndStore(apiKey: string): string {
  const { encryptedKey, iv, authTag } = encryptApiKey(apiKey)
  return `${encryptedKey}:${iv}:${authTag}`
}

export function decryptFromStorage(storedValue: string): string {
  const [encryptedKey, iv, authTag] = storedValue.split(':')
  return decryptApiKey(encryptedKey, iv, authTag)
}
