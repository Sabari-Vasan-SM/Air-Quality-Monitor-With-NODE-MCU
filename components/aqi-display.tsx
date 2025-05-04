"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThingSpeak } from "@/components/thingspeak-context"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function AQIDisplay() {
  const { currentData, loading } = useThingSpeak()
  const [aqi, setAqi] = useState({ value: 0, category: "Good", color: "#00e400" })
  const [animate, setAnimate] = useState(false)
  const [parameterContributions, setParameterContributions] = useState({
    temperature: { value: 0, contribution: 0 },
    humidity: { value: 0, contribution: 0 },
    co2: { value: 0, contribution: 0 },
    gases: { value: 0, contribution: 0 },
  })

  // Calculate AQI based on sensor readings
  useEffect(() => {
    if (!currentData) return

    // Extract values from current data
    const temperature = currentData.field1 ? Number.parseFloat(currentData.field1) : 0
    const humidity = currentData.field2 ? Number.parseFloat(currentData.field2) : 0
    const co2 = currentData.field3 ? Number.parseFloat(currentData.field3) : 0
    const lpg = currentData.field4 ? Number.parseFloat(currentData.field4) : 0
    const propane = currentData.field5 ? Number.parseFloat(currentData.field5) : 0
    const butane = currentData.field6 ? Number.parseFloat(currentData.field6) : 0

    // Calculate contributions to AQI
    let tempContribution = 0
    let humidityContribution = 0
    let co2Contribution = 0
    let gasContribution = 0

    // Temperature contribution (normal indoor range 20-25°C)
    if (temperature < 15)
      tempContribution = 30 // Too cold
    else if (temperature < 20)
      tempContribution = 20 // Slightly cold
    else if (temperature <= 25)
      tempContribution = 0 // Ideal range
    else if (temperature <= 30)
      tempContribution = 30 // Warm
    else tempContribution = 50 // Too hot

    // Humidity contribution (ideal range 30-60%)
    if (humidity < 20)
      humidityContribution = 40 // Too dry
    else if (humidity < 30)
      humidityContribution = 20 // Slightly dry
    else if (humidity <= 60)
      humidityContribution = 0 // Ideal range
    else if (humidity <= 70)
      humidityContribution = 20 // Slightly humid
    else humidityContribution = 40 // Too humid

    // CO2 contribution (normal indoor levels 400-1000 ppm)
    if (co2 < 400) co2Contribution = 0
    else if (co2 < 1000)
      co2Contribution = Math.round(((co2 - 400) / 600) * 50) // 0-50 for normal range
    else if (co2 < 2000)
      co2Contribution = 50 + Math.round(((co2 - 1000) / 1000) * 50) // 50-100 for elevated
    else if (co2 < 5000)
      co2Contribution = 100 + Math.round(((co2 - 2000) / 3000) * 100) // 100-200 for high
    else co2Contribution = 200 + Math.round(((co2 - 5000) / 5000) * 100) // 200-300 for very high

    // Gas contribution (LPG, propane, butane)
    const gasAvg = (lpg + propane + butane) / 3
    if (gasAvg < 100) gasContribution = 0
    else if (gasAvg < 500) gasContribution = Math.round((gasAvg / 500) * 50)
    else if (gasAvg < 1000) gasContribution = 50 + Math.round(((gasAvg - 500) / 500) * 50)
    else if (gasAvg < 2000) gasContribution = 100 + Math.round(((gasAvg - 1000) / 1000) * 100)
    else gasContribution = 200 + Math.round(((gasAvg - 2000) / 3000) * 100)

    // Store parameter contributions
    setParameterContributions({
      temperature: { value: temperature, contribution: tempContribution },
      humidity: { value: humidity, contribution: humidityContribution },
      co2: { value: co2, contribution: co2Contribution },
      gases: { value: gasAvg, contribution: gasContribution },
    })

    // Calculate weighted AQI (CO2 and gases have higher weight)
    const weightedAQI = Math.round(
      tempContribution * 0.1 + humidityContribution * 0.1 + co2Contribution * 0.4 + gasContribution * 0.4,
    )

    // Cap at 500
    const aqiValue = Math.min(500, weightedAQI)

    // Determine category and color
    let category, color
    if (aqiValue <= 50) {
      category = "Good"
      color = "#00e400" // Green
    } else if (aqiValue <= 100) {
      category = "Moderate"
      color = "#ffff00" // Yellow
    } else if (aqiValue <= 150) {
      category = "Unhealthy for Sensitive Groups"
      color = "#ff7e00" // Orange
    } else if (aqiValue <= 200) {
      category = "Unhealthy"
      color = "#ff0000" // Red
    } else if (aqiValue <= 300) {
      category = "Very Unhealthy"
      color = "#8f3f97" // Purple
    } else {
      category = "Hazardous"
      color = "#7e0023" // Maroon
    }

    // Trigger animation when AQI changes
    if (aqi.value !== aqiValue) {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 1000)
    }

    setAqi({ value: aqiValue, category, color })
  }, [currentData])

  if (loading) {
    return (
      <Card className="border-emerald-100 shadow-sm h-full flex items-center justify-center">
        <div className="text-center p-6">
          <div className="animate-pulse h-16 w-16 bg-emerald-100 rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading AQI data...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-100 shadow-sm overflow-hidden h-full">
      <CardContent className="p-4">
        <div className="relative flex flex-col h-full">
          {/* Background gradient based on AQI */}
          <div
            className="absolute inset-0 w-full h-full transition-colors duration-1000 -z-10"
            style={{
              background: `linear-gradient(135deg, ${aqi.color}22 0%, ${aqi.color}44 100%)`,
            }}
          />

          {/* AQI Value */}
          <AnimatePresence mode="wait">
            <motion.div
              key={aqi.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4"
            >
              <motion.div
                className="text-5xl font-bold"
                animate={animate ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
                style={{ color: aqi.color }}
              >
                {aqi.value}
              </motion.div>
              <div className="text-xl font-medium mt-1" style={{ color: aqi.color }}>
                AQI
              </div>
              <div className="text-sm mt-1 max-w-[200px] mx-auto text-center">{aqi.category}</div>
            </motion.div>
          </AnimatePresence>

          {/* Parameter contributions */}
          <div className="space-y-3 mt-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Temperature</span>
                <span className="font-medium">{parameterContributions.temperature.value.toFixed(1)}°C</span>
              </div>
              <Progress
                value={Math.min(100, (parameterContributions.temperature.contribution / 50) * 100)}
                className="h-2"
                indicatorClassName={getProgressColor(parameterContributions.temperature.contribution)}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Humidity</span>
                <span className="font-medium">{parameterContributions.humidity.value.toFixed(1)}%</span>
              </div>
              <Progress
                value={Math.min(100, (parameterContributions.humidity.contribution / 50) * 100)}
                className="h-2"
                indicatorClassName={getProgressColor(parameterContributions.humidity.contribution)}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CO₂</span>
                <span className="font-medium">{parameterContributions.co2.value.toFixed(0)} ppm</span>
              </div>
              <Progress
                value={Math.min(100, (parameterContributions.co2.contribution / 300) * 100)}
                className="h-2"
                indicatorClassName={getProgressColor(parameterContributions.co2.contribution)}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Gas Levels</span>
                <span className="font-medium">{parameterContributions.gases.value.toFixed(0)} ppm</span>
              </div>
              <Progress
                value={Math.min(100, (parameterContributions.gases.contribution / 300) * 100)}
                className="h-2"
                indicatorClassName={getProgressColor(parameterContributions.gases.contribution)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get progress bar color based on contribution value
function getProgressColor(contribution) {
  if (contribution <= 10) return "bg-green-500"
  if (contribution <= 50) return "bg-yellow-500"
  if (contribution <= 100) return "bg-orange-500"
  if (contribution <= 200) return "bg-red-500"
  return "bg-purple-500"
}
