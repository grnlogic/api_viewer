import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function GET() {
  try {
    const data = await apiCall(API_ENDPOINTS.STATUS_OVERVIEW)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching status overview:", error)
    return NextResponse.json({ error: "Failed to fetch status overview from backend" }, { status: 500 })
  }
}
