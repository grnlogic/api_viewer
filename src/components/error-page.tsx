"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  RefreshCw,
  Home,
  Wifi,
  WifiOff,
  Server,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface ErrorPageProps {
  error?: string;
  errorType?: "connection" | "server" | "network" | "maintenance";
  onRetry?: () => void;
  showBackToHome?: boolean;
}

export function ErrorPage({
  error,
  errorType = "connection",
  onRetry,
  showBackToHome = true,
}: ErrorPageProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getErrorConfig = (type: string) => {
    switch (type) {
      case "connection":
        return {
          icon: <WifiOff className="h-12 w-12 text-red-500" />,
          title: "Koneksi Terputus",
          description:
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "server":
        return {
          icon: <Server className="h-12 w-12 text-orange-500" />,
          title: "Server Error",
          description:
            "Server sedang mengalami masalah. Tim kami sedang menangani masalah ini.",
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
      case "network":
        return {
          icon: <Wifi className="h-12 w-12 text-blue-500" />,
          title: "Network Error",
          description:
            "Masalah jaringan terdeteksi. Silakan coba lagi dalam beberapa saat.",
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "maintenance":
        return {
          icon: <Activity className="h-12 w-12 text-yellow-500" />,
          title: "Sedang Maintenance",
          description:
            "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-gray-500" />,
          title: "Terjadi Kesalahan",
          description:
            "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const errorConfig = getErrorConfig(errorType);

  return (
    <div className="min-h-screen error-gradient flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Header dengan Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="PADUD Jaya Logo"
              width={120}
              height={60}
              className="h-16 w-auto logo-animate"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            PADUD Jaya Status Monitor
          </h1>
          <p className="text-muted-foreground">Monitoring sistem real-time</p>
        </div>

        {/* Error Card */}
        <Card
          className={`${errorConfig.bgColor} ${errorConfig.borderColor} border-2 shadow-lg error-card-shadow`}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div
                className={`${
                  error?.includes("Failed to fetch")
                    ? "animate-failed-fetch"
                    : "animate-error-shake"
                }`}
              >
                {errorConfig.icon}
              </div>
            </div>
            <CardTitle className={`text-xl font-bold ${errorConfig.color}`}>
              {errorConfig.title}
            </CardTitle>
            <CardDescription className="text-base">
              {errorConfig.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            {error && (
              <Alert variant="destructive" className={`${error.includes("Failed to fetch") ? "animate-failed-fetch" : "animate-error-shake"}`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                Error ID: {Date.now().toString(36)}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`flex-1 sm:flex-none ${error?.includes("Failed to fetch") ? "animate-failed-fetch" : ""}`}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isRetrying ? "animate-spin" : ""
                    }`}
                  />
                  {isRetrying ? "Mencoba..." : "Coba Lagi"}
                </Button>
              )}

              {showBackToHome && (
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 sm:flex-none"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              )}
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Jika masalah berlanjut, silakan hubungi tim support kami</p>
              <div className="flex items-center justify-center gap-4">
                <span>Email: geranuser@gmail.com</span>
                <span>Telp: +62 895352281010</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <ThemeToggle />
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 PADUD Jaya. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
