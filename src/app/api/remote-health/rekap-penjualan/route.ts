import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function GET() {
  try {
    const data = await apiCall(API_ENDPOINTS.REMOTE_HEALTH)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking external API health:", error)
    return NextResponse.json({ error: "External API health check failed", status: "outage" }, { status: 503 })
  }
}
