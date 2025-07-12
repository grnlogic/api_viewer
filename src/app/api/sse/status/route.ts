import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://45.158.126.252:8082";

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      // Send initial connection message
      const data = JSON.stringify({
        type: "connected",
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Connect to backend SSE endpoint using fetch streaming
      let backendResponse: Response | null = null;
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let cancelled = false;

      try {
        backendResponse = await fetch(`${backendUrl}/api/sse/status`);
        if (!backendResponse.body)
          throw new Error("No body in backend SSE response");
        reader = backendResponse.body.getReader();

        async function read() {
          if (cancelled || !reader || closed) return;
          try {
            const { done, value } = await reader.read();
            if (done) {
              closed = true;
              controller.close();
              return;
            }
            controller.enqueue(value);
            read();
          } catch (err) {
            const errorData = JSON.stringify({
              type: "error",
              message: "Backend connection lost",
              timestamp: new Date().toISOString(),
            });
            if (!closed)
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            closed = true;
            controller.close();
          }
        }
        read();
      } catch (error) {
        console.error("Failed to connect to backend SSE:", error);
        const errorData = JSON.stringify({
          type: "error",
          message: "Failed to connect to backend SSE",
          timestamp: new Date().toISOString(),
        });
        if (!closed)
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        closed = true;
        controller.close();
      }

      // Send periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        if (closed) return;
        const heartbeat = JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${heartbeat}\n\n`));
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        cancelled = true;
        closed = true;
        clearInterval(heartbeatInterval);
        if (reader) reader.cancel();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
