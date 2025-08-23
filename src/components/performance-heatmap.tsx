"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, TrendingUp, Activity, Thermometer } from 'lucide-react'
import * as d3 from 'd3'

interface HeatmapData {
  service: string
  timestamp: string
  metric: string
  value: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface PerformanceHeatmapProps {
  className?: string
}

export function PerformanceHeatmap({ className }: PerformanceHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>('response_time')
  const [timeRange, setTimeRange] = useState<string>('1h')
  const [data, setData] = useState<HeatmapData[]>([])
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null)

  const services = [
    'Frontend Dashboard',
    'Status API',
    'Auth Service',
    'Database',
    'Cache Redis',
    'Reporting Service',
    'Mobile API',
    'Admin Panel',
    'LDAP Server'
  ]

  const metrics = [
    { id: 'response_time', name: 'Response Time', unit: 'ms' },
    { id: 'cpu_usage', name: 'CPU Usage', unit: '%' },
    { id: 'memory_usage', name: 'Memory Usage', unit: '%' },
    { id: 'error_rate', name: 'Error Rate', unit: '%' },
    { id: 'throughput', name: 'Throughput', unit: 'req/s' },
    { id: 'disk_io', name: 'Disk I/O', unit: 'MB/s' }
  ]

  // Generate sample real-time data
  const generateSampleData = () => {
    const now = new Date()
    const timeSlots: string[] = []
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24
    const intervalMinutes = timeRange === '1h' ? 5 : timeRange === '6h' ? 30 : 60

    // Generate time slots
    for (let i = hoursBack * 60; i >= 0; i -= intervalMinutes) {
      const time = new Date(now.getTime() - i * 60 * 1000)
      timeSlots.push(time.toISOString())
    }

    const newData: HeatmapData[] = []

    services.forEach(service => {
      timeSlots.forEach(timestamp => {
        // Generate realistic values based on service and time
        let value = 0
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

        switch (selectedMetric) {
          case 'response_time':
            value = Math.random() * 500 + 50
            if (service === 'Database') value *= 1.5
            if (service === 'Mobile API') value *= 0.8
            severity = value > 300 ? 'critical' : value > 200 ? 'high' : value > 100 ? 'medium' : 'low'
            break
          case 'cpu_usage':
            value = Math.random() * 100
            if (service === 'Database') value = Math.min(100, value + 20)
            severity = value > 80 ? 'critical' : value > 60 ? 'high' : value > 40 ? 'medium' : 'low'
            break
          case 'memory_usage':
            value = Math.random() * 100
            if (service === 'Cache Redis') value = Math.min(100, value + 15)
            severity = value > 85 ? 'critical' : value > 70 ? 'high' : value > 50 ? 'medium' : 'low'
            break
          case 'error_rate':
            value = Math.random() * 10
            if (service === 'Reporting Service') value *= 2
            severity = value > 5 ? 'critical' : value > 2 ? 'high' : value > 1 ? 'medium' : 'low'
            break
          case 'throughput':
            value = Math.random() * 1000 + 100
            if (service === 'Frontend Dashboard') value *= 1.5
            severity = value < 200 ? 'critical' : value < 400 ? 'high' : value < 600 ? 'medium' : 'low'
            break
          case 'disk_io':
            value = Math.random() * 100
            if (service === 'Database') value *= 2
            severity = value > 80 ? 'critical' : value > 60 ? 'high' : value > 40 ? 'medium' : 'low'
            break
        }

        newData.push({
          service,
          timestamp,
          metric: selectedMetric,
          value: Math.round(value * 10) / 10,
          severity
        })
      })
    })

    setData(newData)
  }

  useEffect(() => {
    generateSampleData()
    // Set up auto-refresh
    const interval = setInterval(generateSampleData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedMetric, timeRange])

  useEffect(() => {
    if (data.length > 0) {
      drawHeatmap()
    }
  }, [data])

  const drawHeatmap = () => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 50, right: 120, bottom: 50, left: 150 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get unique timestamps and services
    const timestamps = Array.from(new Set(data.map(d => d.timestamp))).sort()
    const serviceNames = Array.from(new Set(data.map(d => d.service)))

    // Create scales
    const xScale = d3.scaleBand()
      .domain(timestamps)
      .range([0, width])
      .padding(0.05)

    const yScale = d3.scaleBand()
      .domain(serviceNames)
      .range([0, height])
      .padding(0.05)

    // Color scale based on severity
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['low', 'medium', 'high', 'critical'])
      .range(['#10b981', '#f59e0b', '#f97316', '#ef4444'])

    // Create heatmap cells
    const cells = g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.timestamp) || 0)
      .attr('y', d => yScale(d.service) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.severity))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        setHoveredCell(d)
        d3.select(this)
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
      })
      .on('mouseout', function() {
        setHoveredCell(null)
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
      })

    // Add animations
    cells
      .style('opacity', 0)
      .transition()
      .duration(500)
      .style('opacity', 1)

    // Add value text on cells (for smaller datasets)
    if (timestamps.length <= 12) {
      g.selectAll('.cell-text')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'cell-text')
        .attr('x', d => (xScale(d.timestamp) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.service) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(d => d.value.toFixed(1))
        .style('pointer-events', 'none')
    }

    // X-axis (timestamps)
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, i) => {
        const date = new Date(d as string)
        return timeRange === '1h' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleTimeString('en-US', { hour: '2-digit' })
      })

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    // Y-axis (services)
    const yAxis = d3.axisLeft(yScale)

    g.append('g')
      .call(yAxis)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + margin.left + 10}, ${margin.top})`)

    const legendItems = ['low', 'medium', 'high', 'critical']
    const legendLabels = ['Normal', 'Warning', 'High', 'Critical']

    legend.selectAll('.legend-item')
      .data(legendItems)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)
      .each(function(d, i) {
        const item = d3.select(this)
        
        item.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(d))
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
        
        item.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .attr('font-size', '12px')
          .attr('fill', 'currentColor')
          .text(legendLabels[i])
      })
  }

  const getCurrentMetric = () => {
    return metrics.find(m => m.id === selectedMetric) || metrics[0]
  }

  const getAverageValue = () => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.value, 0)
    return (sum / data.length).toFixed(1)
  }

  const getCriticalCount = () => {
    return data.filter(d => d.severity === 'critical').length
  }

  const getHighCount = () => {
    return data.filter(d => d.severity === 'high').length
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Performance Heatmap
            <Badge variant="outline" className="ml-2">
              Real-time
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="6h">6H</SelectItem>
                <SelectItem value="24h">24H</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={generateSampleData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span>Avg: {getAverageValue()} {getCurrentMetric().unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical: {getCriticalCount()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>High: {getHighCount()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <svg ref={svgRef} className="w-full h-full" />
          </div>
          
          {hoveredCell && (
            <div className="w-64 p-4 border rounded-lg bg-white dark:bg-gray-800">
              <h3 className="font-semibold text-lg mb-2">Performance Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{hoveredCell.service}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metric:</span>
                  <span>{getCurrentMetric().name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className={`font-bold ${
                    hoveredCell.severity === 'critical' ? 'text-red-500' :
                    hoveredCell.severity === 'high' ? 'text-orange-500' :
                    hoveredCell.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {hoveredCell.value} {getCurrentMetric().unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Severity:</span>
                  <Badge variant={
                    hoveredCell.severity === 'critical' ? 'destructive' :
                    hoveredCell.severity === 'high' ? 'secondary' :
                    hoveredCell.severity === 'medium' ? 'outline' : 'default'
                  }>
                    {hoveredCell.severity.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="text-sm">
                    {new Date(hoveredCell.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <strong>Interpretation:</strong>
                <br />
                {hoveredCell.severity === 'critical' && 'Immediate attention required'}
                {hoveredCell.severity === 'high' && 'Performance degradation detected'}
                {hoveredCell.severity === 'medium' && 'Monitor closely'}
                {hoveredCell.severity === 'low' && 'Normal operation'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
