"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface HeatMapProps {
  title: string
  value: string | null
  unit: string
  icon: string
  warning?: number
  critical?: number
  showAlert?: boolean
  min: number
  max: number
  colorStops: string[]
}

export default function HeatMap({
  title,
  value,
  unit,
  icon,
  warning,
  critical,
  showAlert = true,
  min,
  max,
  colorStops,
}: HeatMapProps) {
  const [percentage, setPercentage] = useState(0)
  const [status, setStatus] = useState<"normal" | "warning" | "critical">("normal")
  const [gradientStyle, setGradientStyle] = useState({})
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (value === null) return

    const numericValue = Number.parseFloat(value)

    // Calculate percentage for positioning on the heat map
    const calculatedPercentage = Math.min(100, Math.max(0, ((numericValue - min) / (max - min)) * 100))
    setPercentage(calculatedPercentage)

    // Set status based on thresholds
    if (showAlert && critical && numericValue > critical) {
      setStatus("critical")
      setIsBlinking(true)
    } else if (showAlert && warning && numericValue > warning) {
      setStatus("warning")
      setIsBlinking(true)
    } else {
      setStatus("normal")
      setIsBlinking(false)
    }

    // Create gradient style
    const gradient = `linear-gradient(to right, ${colorStops.join(", ")})`
    setGradientStyle({ background: gradient })
  }, [value, min, max, warning, critical, showAlert, colorStops])

  return (
    <Card
      className={cn(
        "transition-all duration-300 overflow-hidden",
        status === "critical" ? "border-red-500" : status === "warning" ? "border-yellow-500" : "",
        isBlinking && "animate-blink",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {icon} {title}
        </CardTitle>
        {status === "critical" && showAlert && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold mb-2">
              {value} {unit}
            </div>
            <div className="relative h-8 rounded-full overflow-hidden" style={gradientStyle}>
              <div
                className="absolute top-0 h-full w-1 bg-black border-2 border-white shadow-md transition-all duration-300"
                style={{ left: `calc(${percentage}% - 2px)` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{min}</span>
              <span>{max}</span>
            </div>
            {status !== "normal" && showAlert && (
              <p className={`text-sm mt-2 ${status === "critical" ? "text-red-500" : "text-yellow-500"}`}>
                {status === "critical" ? "Critical level" : "Above recommended level"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
