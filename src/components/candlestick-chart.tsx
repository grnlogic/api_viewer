"use client"

import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useRef } from "react"

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  status: "operational" | "degraded" | "outage"
}

interface CandlestickChartProps {
  data: CandlestickData[]
}
//test
export function CandlestickChart({ data }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Transform data for candlestick visualization
  const chartData = data.map((item) => ({
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    status: item.status,
    displayDate: new Date(item.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !chartData.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Chart dimensions
    const padding = { top: 10, right: 10, bottom: 20, left: 10 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Find min/max values
    const allValues = chartData.flatMap((d) => [d.open, d.high, d.low, d.close])
    const minValue = Math.min(...allValues) - 5
    const maxValue = Math.max(...allValues) + 5

    // Calculate positions
    const candleWidth = Math.max(2, chartWidth / chartData.length - 2)
    const candleSpacing = chartWidth / chartData.length

    // Draw candlesticks
    chartData.forEach((item, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2

      // Scale values to chart height
      const scaleY = (value: number) =>
        padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight

      const openY = scaleY(item.open)
      const closeY = scaleY(item.close)
      const highY = scaleY(item.high)
      const lowY = scaleY(item.low)

      // Determine candle color based on open/close
      const isGreen = item.close >= item.open
      const candleColor = isGreen ? "#10b981" : "#ef4444" // green-500 : red-500
      const wickColor = isGreen ? "#059669" : "#dc2626" // green-600 : red-600

      // Draw wick (high-low line)
      ctx.strokeStyle = wickColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw candle body
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)
      const minBodyHeight = 1 // Minimum height for doji candles

      ctx.fillStyle = candleColor
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, minBodyHeight))

      // Add border to candle body
      ctx.strokeStyle = wickColor
      ctx.lineWidth = 0.5
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, minBodyHeight))
    })

    // Draw grid lines (optional)
    ctx.strokeStyle = "#f3f4f6"
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 2])

    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }, [chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-sm">{data.displayDate}</p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`font-medium capitalize ${
                  data.status === "operational"
                    ? "text-green-600"
                    : data.status === "degraded"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {data.status}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Open:</span>
              <span className="font-medium">{data.open.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">High:</span>
              <span className="font-medium text-green-600">{data.high.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Low:</span>
              <span className="font-medium text-red-600">{data.low.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Close:</span>
              <span className="font-medium">{data.close.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

      {/* Invisible chart for tooltip functionality */}
      <div className="absolute inset-0 opacity-0 pointer-events-auto">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
