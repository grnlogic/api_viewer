import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function GET() {
  try {
    const data = await apiCall(API_ENDPOINTS.SERVICES)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services from backend" }, { status: 500 })
  }
}
