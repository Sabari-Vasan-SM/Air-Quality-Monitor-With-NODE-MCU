"use client"

import { useThingSpeak } from "@/components/thingspeak-context"
import HeatMap from "@/components/heat-map"
import { motion } from "framer-motion"

export default function ParameterGrid() {
  const { currentData, loading } = useThingSpeak()

  // Define thresholds for parameters
  const thresholds = {
    temperature: { warning: 30, critical: 35 }, // °C
    humidity: { warning: 70, critical: 85 }, // %
    co2: { warning: 250, critical: 1000 }, // ppm
    lpg: { warning: 1000, critical: 2000 }, // ppm
    propane: { warning: 200, critical: 1000 }, // ppm
    butane: { warning: 200, critical: 1000 }, // ppm
  }

  // Define all parameters
  const parameters = [
    {
      title: "Temperature",
      value: loading ? null : currentData?.field1,
      unit: "°C",
      icon: "🌡️",
      min: 0,
      max: 40,
      colorStops: ["#3498db", "#2ecc71", "#f1c40f", "#e67e22", "#e74c3c"],
      showAlert: false,
    },
    {
      title: "Humidity",
      value: loading ? null : currentData?.field2,
      unit: "%",
      icon: "💧",
      min: 0,
      max: 100,
      colorStops: ["#f5f5f5", "#d4f1f9", "#7fb3d5", "#2980b9", "#1a5276"],
      warning: thresholds.humidity.warning,
      critical: thresholds.humidity.critical,
    },
    {
      title: "CO₂ (MQ135)",
      value: loading ? null : currentData?.field3,
      unit: "ppm",
      icon: "🌬️",
      min: 0,
      max: 2000,
      colorStops: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b"],
      warning: thresholds.co2.warning,
      critical: thresholds.co2.critical,
    },
    {
      title: "LPG (MQ6)",
      value: loading ? null : currentData?.field4,
      unit: "ppm",
      icon: "🔥",
      min: 0,
      max: 3000,
      colorStops: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b"],
      warning: thresholds.lpg.warning,
      critical: thresholds.lpg.critical,
    },
    {
      title: "Propane (MQ6)",
      value: loading ? null : currentData?.field5,
      unit: "ppm",
      icon: "💨",
      min: 0,
      max: 3000,
      colorStops: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b"],
      warning: thresholds.propane.warning,
      critical: thresholds.propane.critical,
    },
    {
      title: "Butane (MQ6)",
      value: loading ? null : currentData?.field6,
      unit: "ppm",
      icon: "🧪",
      min: 0,
      max: 3000,
      colorStops: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b"],
      warning: thresholds.butane.warning,
      critical: thresholds.butane.critical,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {parameters.map((parameter, index) => (
        <motion.div
          key={parameter.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="h-full"
        >
          <HeatMap {...parameter} />
        </motion.div>
      ))}
    </div>
  )
}
