"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/components/error-page";

export default function Error({
  error,
  reset,
}: {
  error: any;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error) {
      console.error("Global error:", error);
    }
  }, [error]);

  // Determine error type based on error message
  let errorType: "connection" | "server" | "network" | "maintenance" = "server";
  const errorMessage =
    (error &&
      typeof error === "object" &&
      "message" in error &&
      error.message) ||
    (typeof error === "string"
      ? error
      : "Terjadi kesalahan yang tidak diketahui.");

  if (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("network")
  ) {
    errorType = "network";
  } else if (errorMessage.includes("maintenance")) {
    errorType = "maintenance";
  } else if (errorMessage.includes("connection")) {
    errorType = "connection";
  }

  return (
    <ErrorPage
      error={errorMessage}
      errorType={errorType}
      onRetry={reset}
      showBackToHome={true}
    />
  );
}
