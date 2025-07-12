import { NextResponse } from "next/server";
import { apiCall, API_ENDPOINTS } from "@/lib/api";

export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "90";

    const data = await apiCall(
      API_ENDPOINTS.METRICS(params.serviceId, parseInt(days))
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics from backend" },
      { status: 500 }
    );
  }
}
