import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function GET() {
  try {
    const data = await apiCall(API_ENDPOINTS.SYSTEM_HEALTH)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching system health:", error)
    return NextResponse.json({ error: "Failed to fetch system health from backend" }, { status: 500 })
  }
}
