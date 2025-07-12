import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

// Function to generate status history (kept for reference or potential fallback)
function generateStatusHistory(serviceId: string, days = 90) {
  const history = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate realistic candlestick data based on service
    let baseValue = 95
    let volatility = 5
    let status: "operational" | "degraded" | "outage" = "operational"

    // Simulate different patterns for different services
    if (serviceId === "database") {
      baseValue = 85
      volatility = 15
      if (Math.random() < 0.1) status = "degraded"
    } else if (serviceId === "file-storage") {
      baseValue = 70
      volatility = 20
      if (Math.random() < 0.05) status = "outage"
      else if (Math.random() < 0.15) status = "degraded"
    }

    const open = baseValue + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility * 0.8
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3

    // Adjust status based on close value
    if (close < 60) status = "outage"
    else if (close < 80) status = "degraded"
    else status = "operational"

    history.push({
      date: date.toISOString().split("T")[0],
      open: Math.max(0, Math.min(100, open)),
      high: Math.max(0, Math.min(100, high)),
      low: Math.max(0, Math.min(100, low)),
      close: Math.max(0, Math.min(100, close)),
      status,
    })
  }

  return history
}

export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "90")

    const data = await apiCall(API_ENDPOINTS.STATUS_HISTORY(params.serviceId, days))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching status history:", error)
    return NextResponse.json({ error: "Failed to fetch status history from backend" }, { status: 500 })
  }
}
