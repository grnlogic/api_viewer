import { NextResponse } from "next/server"
import { apiCall, API_ENDPOINTS } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "90"
    const daysNum = Number(days)

    // Ambil data dari backend Java
    const data = await apiCall(API_ENDPOINTS.STATUS_HISTORY(params.serviceId, daysNum))

    // Jika backend sudah mengembalikan format yang sesuai, langsung return
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching status history from backend:", error)
    return NextResponse.json({ error: "Failed to fetch status history from backend" }, { status: 500 })
  }
}
