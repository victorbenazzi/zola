import { createHash, randomBytes } from "crypto"

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex")
}

export function validateCsrfToken(token: string): boolean {
  return typeof token === "string" && token.length === 64
}
