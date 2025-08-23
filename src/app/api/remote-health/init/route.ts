import { NextResponse } from "next/server";

export async function POST() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://45.158.126.252:8082";
    
    // Data backend yang akan ditambahkan
    const remoteBackends = [
      {
        name: "Rekap Penjualan",
        url: "https://rekap-penjualan-api.padudjayaputera.com",
        healthEndpoint: "/api/health/status",
        description: "Backend untuk sistem rekap penjualan",
        enabled: true,
      },
      {
        name: "Laporan Harian", 
        url: "https://laporan-harian.padudjayaputera.com",
        healthEndpoint: "/api/health/status",
        description: "Backend untuk sistem laporan harian",
        enabled: true,
      },
    ];

    const results = [];
    
    for (const backend of remoteBackends) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/remote-health/backends`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backend),
        });

        if (response.ok) {
          const savedBackend = await response.json();
          results.push({ success: true, backend: savedBackend });
        } else {
          // Mungkin sudah ada, skip error
          results.push({ success: false, error: `${response.status} ${response.statusText}`, backend: backend.name });
        }
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : "Unknown error", backend: backend.name });
      }
    }

    return NextResponse.json({
      message: "Initialization completed",
      results,
    });
  } catch (error) {
    console.error("Error initializing remote backends:", error);
    return NextResponse.json(
      { error: "Failed to initialize remote backends" },
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
