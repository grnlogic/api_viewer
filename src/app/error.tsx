"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/error-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  // Determine error type based on error message
  let errorType: "connection" | "server" | "network" | "maintenance" = "server";

  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("network")
  ) {
    errorType = "network";
  } else if (error.message.includes("maintenance")) {
    errorType = "maintenance";
  } else if (error.message.includes("connection")) {
    errorType = "connection";
  }

  return (
    <ErrorPage
      error={error.message}
      errorType={errorType}
      onRetry={reset}
      showBackToHome={true}
    />
  );
}
