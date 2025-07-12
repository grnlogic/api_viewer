"use client"

interface StatusTimelineProps {
  data: Array<{
    date: string
    status: "operational" | "degraded" | "outage"
  }>
}

export function StatusTimeline({ data }: StatusTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "#10b981" // green-500
      case "degraded":
        return "#f59e0b" // yellow-500
      case "outage":
        return "#ef4444" // red-500
      default:
        return "#6b7280" // gray-500
    }
  }

  return (
    <div className="flex items-center gap-0.5 h-8">
      {data.slice(-90).map((item, index) => (
        <div
          key={index}
          className="flex-1 h-8 min-w-[2px] rounded-sm transition-all hover:scale-y-110 cursor-pointer"
          style={{ backgroundColor: getStatusColor(item.status) }}
          title={`${new Date(item.date).toLocaleDateString("id-ID")}: ${item.status}`}
        />
      ))}
    </div>
  )
}
