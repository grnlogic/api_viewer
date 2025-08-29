"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Square,
  Trash2,
  Download,
  Filter,
  Settings,
  Terminal,
  Activity,
} from "lucide-react";

interface LogEntry {
  timestamp: number;
  level?: string;
  message: string;
  source: string;
  rawLine?: string;
  parsed?: {
    level: string;
    timestamp: string;
    message: string;
  };
}

interface LogViewerProps {
  title: string;
  endpoint: string;
  icon?: React.ReactNode;
  defaultParams?: Record<string, string>;
}

export default function LogViewer({
  title,
  endpoint,
  icon,
  defaultParams = {},
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [maxLines, setMaxLines] = useState(500);
  const [autoScroll, setAutoScroll] = useState(true);

  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const connectToLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsLoading(true);
    setError(null);

    // Build URL with parameters
    const params = new URLSearchParams({
      ...defaultParams,
      level: filterLevel === "ALL" ? "INFO" : filterLevel,
    });

    const url = `${API_BASE}/api/logs/${endpoint}?${params}`;
    console.log("Connecting to:", url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("Connected to log stream");
      setIsConnected(true);
      setIsLoading(false);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: data.timestamp || Date.now(),
          level: data.level || data.parsed?.level || "INFO",
          message: data.message || data.rawLine || JSON.stringify(data),
          source: data.source || "unknown",
          rawLine: data.rawLine,
          parsed: data.parsed,
        };

        setLogs((prev) => {
          const newLogs = [...prev, logEntry];
          // Keep only the last maxLines entries
          return newLogs.slice(-maxLines);
        });
      } catch (e) {
        console.error("Failed to parse log data:", e, event.data);
      }
    };

    eventSource.addEventListener("log", (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: data.timestamp || Date.now(),
          level: data.parsed?.level || "INFO",
          message: data.rawLine || data.message || JSON.stringify(data),
          source: data.source || "log",
          rawLine: data.rawLine,
          parsed: data.parsed,
        };

        setLogs((prev) => {
          const newLogs = [...prev, logEntry];
          return newLogs.slice(-maxLines);
        });
      } catch (e) {
        console.error("Failed to parse log event:", e, event.data);
      }
    });

    eventSource.addEventListener("monitoring", (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: data.timestamp || Date.now(),
          level: data.level || "INFO",
          message: `${data.message} - ${JSON.stringify(data.data || {})}`,
          source: data.source || "monitoring",
        };

        setLogs((prev) => {
          const newLogs = [...prev, logEntry];
          return newLogs.slice(-maxLines);
        });
      } catch (e) {
        console.error("Failed to parse monitoring event:", e, event.data);
      }
    });

    eventSource.onerror = (event) => {
      console.error("EventSource error:", event);
      setError("Connection lost. Trying to reconnect...");
      setIsConnected(false);
      setIsLoading(false);

      // Auto reconnect after 3 seconds
      setTimeout(() => {
        if (!isConnected) {
          connectToLogStream();
        }
      }, 3000);
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `${new Date(log.timestamp).toISOString()} [${log.level}] [${
            log.source
          }] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title
      .toLowerCase()
      .replace(/\s+/g, "-")}-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return "text-red-400 bg-red-900/20";
      case "WARN":
        return "text-yellow-400 bg-yellow-900/20";
      case "INFO":
        return "text-blue-400 bg-blue-900/20";
      case "DEBUG":
        return "text-gray-400 bg-gray-900/20";
      case "TRACE":
        return "text-purple-400 bg-purple-900/20";
      default:
        return "text-green-400 bg-green-900/20";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredLogs = logs.filter(
    (log) => filterLevel === "ALL" || log.level?.toUpperCase() === filterLevel
  );

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline">{filteredLogs.length} lines</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Controls */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-2 py-1 text-sm border rounded bg-background"
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warn</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
              <option value="TRACE">Trace</option>
            </select>

            {/* Control Buttons */}
            {!isConnected ? (
              <Button
                onClick={connectToLogStream}
                disabled={isLoading}
                size="sm"
                variant="default"
              >
                <Play className="h-4 w-4 mr-1" />
                {isLoading ? "Connecting..." : "Start"}
              </Button>
            ) : (
              <Button onClick={disconnect} size="sm" variant="secondary">
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            )}

            <Button onClick={clearLogs} size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button onClick={downloadLogs} size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setAutoScroll(!autoScroll)}
              size="sm"
              variant={autoScroll ? "default" : "outline"}
            >
              Auto Scroll
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="h-full w-full overflow-auto" ref={scrollAreaRef}>
          <div className="p-4 font-mono text-sm space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {isConnected
                  ? "Waiting for logs..."
                  : "Click Start to begin streaming logs"}
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-gray-500 text-xs shrink-0 w-20">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${getLevelColor(
                      log.level || "INFO"
                    )}`}
                  >
                    {log.level || "INFO"}
                  </Badge>

                  <Badge variant="secondary" className="text-xs shrink-0">
                    {log.source}
                  </Badge>

                  <span className="flex-1 break-words">{log.message}</span>
                </div>
              ))
            )}
            <div ref={endOfLogsRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
