"use client";

import Image from "next/image";
import { Loader2, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface LoadingPageProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingPage({
  message = "Memuat data...",
  showProgress = false,
}: LoadingPageProps) {
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

        {/* Loading Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 border-2 shadow-lg error-card-shadow">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Activity className="h-12 w-12 text-blue-500 animate-pulse" />
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-blue-600">
              Sedang Memuat
            </CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Loading Animation */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Menghubungkan ke server...
              </p>
            </div>

            {/* Progress Bar (Optional) */}
            {showProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                Loading...
              </Badge>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Mohon tunggu sebentar sementara sistem memuat data terbaru</p>
              <div className="flex items-center justify-center gap-4">
                <span>Email: support@padudjaya.com</span>
                <span>Telp: +62 21 1234 5678</span>
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
