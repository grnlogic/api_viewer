import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const data = await apiCall(API_ENDPOINTS.WEBHOOKS_STATUS, {
      method: "POST",
      body: body,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
