"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Globe, Calendar } from "lucide-react";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatUTC = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          System Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Local Time */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-primary">
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">WIB (UTC+7)</div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(time)}</span>
        </div>

        {/* UTC Time */}
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>UTC: {formatUTC(time)}</span>
        </div>

        {/* Server Uptime Placeholder */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Server Timezone: Asia/Jakarta
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
