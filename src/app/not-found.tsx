import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
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

        {/* 404 Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 border-2 shadow-lg error-card-shadow">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-xl font-bold text-blue-600">
              Halaman Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-base">
              Halaman yang Anda cari tidak ada atau telah dipindahkan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Code */}
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-500 mb-2">404</div>
              <p className="text-muted-foreground">Page Not Found</p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                Error ID: {Date.now().toString(36)}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 sm:flex-none"
              >
                <Search className="h-4 w-4 mr-2" />
                Kembali ke Halaman Sebelumnya
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Jika Anda yakin ini adalah kesalahan, silakan hubungi tim
                support kami
              </p>
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
