"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, ExternalLink } from "lucide-react";
import Link from "next/link";

interface LogEntry {
  timestamp: number;
  level: string;
  message: string;
  source: string;
}

export default function ActivityLog() {
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    // Connect to monitoring logs for dashboard
    const eventSource = new EventSource(`${API_BASE}/api/logs/monitoring`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: data.timestamp || Date.now(),
          level: data.level || "INFO",
          message: data.message || JSON.stringify(data),
          source: data.source || "monitoring"
        };

        setRecentLogs(prev => {
          const newLogs = [logEntry, ...prev];
          return newLogs.slice(0, 10); // Keep only last 10 entries
        });
      } catch (e) {
        console.error("Failed to parse log data:", e);
      }
    };

    eventSource.addEventListener("monitoring", (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: data.timestamp || Date.now(),
          level: data.level || "INFO",
          message: data.message || JSON.stringify(data),
          source: data.source || "monitoring"
        };

        setRecentLogs(prev => {
          const newLogs = [logEntry, ...prev];
          return newLogs.slice(0, 10);
        });
      } catch (e) {
        console.error("Failed to parse monitoring event:", e);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [API_BASE]);

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'destructive';
      case 'WARN': return 'secondary';
      case 'INFO': return 'default';
      case 'DEBUG': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">Activity Log</CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <Link href="/logs">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 sm:px-6">
        {recentLogs.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
            {isConnected ? "Waiting for activity..." : "Connecting to activity stream..."}
          </div>
        ) : (
          recentLogs.map((log, index) => (
            <div 
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2 sm:gap-2">
                <span className="text-xs text-gray-500 w-12 sm:w-16 shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                
                <Badge 
                  variant={getLevelColor(log.level)}
                  className="text-xs shrink-0"
                >
                  {log.level}
                </Badge>
                
                <Badge variant="outline" className="text-xs shrink-0 sm:hidden">
                  {log.source}
                </Badge>
              </div>
              
              <span className="text-xs sm:text-sm flex-1 truncate pl-14 sm:pl-0">
                {log.message}
              </span>
              
              <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
                {log.source}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
