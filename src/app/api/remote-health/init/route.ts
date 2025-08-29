import { NextResponse } from "next/server";
import { seedDefaultBackends } from "@/lib/backend-api";

export async function POST() {
  try {
    // Use backend API to seed default data
    const result = await seedDefaultBackends();
    
    return NextResponse.json({
      message: "Backend seeding completed",
      result,
    });
  } catch (error) {
    console.error("Error seeding remote backends:", error);
    
    // Check if it's already seeded error
    if (error instanceof Error && error.message.includes("Failed to seed backends: 400")) {
      return NextResponse.json({
        message: "Backends already initialized",
        status: "ALREADY_SEEDED"
      });
    }
    
    return NextResponse.json(
      { error: "Failed to seed remote backends", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to initialize remote backends data",
    endpoints: [
      "POST /api/remote-health/init - Initialize remote backends data"
    ]
  });
}
