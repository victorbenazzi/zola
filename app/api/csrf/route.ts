import { generateCsrfToken } from "@/lib/csrf"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const token = generateCsrfToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating CSRF token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
