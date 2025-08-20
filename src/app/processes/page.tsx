"use client";
import React, { useEffect, useState } from "react";

interface ProcessInfo {
  pid: number;
  name: string;
  user: string;
  cpu: string;
  mem: number;
  commandLine: string;
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/health/system/processes")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data proses");
        return res.json();
      })
      .then((data) => {
        setProcesses(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitoring Proses Server</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">PID</th>
                <th className="px-2 py-1 border">Nama</th>
                <th className="px-2 py-1 border">User</th>
                <th className="px-2 py-1 border">CPU (%)</th>
                <th className="px-2 py-1 border">Memori (MB)</th>
                <th className="px-2 py-1 border">Command Line</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((proc) => (
                <tr key={proc.pid} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border text-center">{proc.pid}</td>
                  <td className="px-2 py-1 border">{proc.name}</td>
                  <td className="px-2 py-1 border">{proc.user}</td>
                  <td className="px-2 py-1 border text-right">{proc.cpu}</td>
                  <td className="px-2 py-1 border text-right">
                    {(proc.mem / 1024 / 1024).toFixed(2)}
                  </td>
                  <td className="px-2 py-1 border text-xs">
                    {proc.commandLine}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
