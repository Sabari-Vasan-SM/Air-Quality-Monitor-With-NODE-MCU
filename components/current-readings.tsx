"use client"

import { useThingSpeak } from "@/components/thingspeak-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, RefreshCw, Phone, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import Recommendations from "@/components/recommendations"
import { toast } from "@/components/ui/use-toast"
import AQIDisplay from "@/components/aqi-display"
import ParameterGrid from "@/components/parameter-grid"
import { motion } from "framer-motion"

export default function CurrentReadings() {
  const { currentData, loading, error, refreshData, alertStatus } = useThingSpeak()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    enableAlerts: true,
    soundAlerts: true,
  })

  // Load notification settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Update the thresholds to match the correct fields and remove the AQI threshold
  const thresholds = {
    temperature: { warning: 30, critical: 35 }, // °C
    humidity: { warning: 70, critical: 85 }, // %
    co2: { warning: 250, critical: 1000 }, // ppm
    lpg: { warning: 1000, critical: 2000 }, // ppm
    propane: { warning: 200, critical: 1000 }, // ppm - updated threshold to 200
    butane: { warning: 200, critical: 1000 }, // ppm - updated threshold to 200
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Format time to 12-hour format
  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Enhanced PDF generation function with better styling
  const generatePDF = () => {
    if (!currentData) return

    try {
      const doc = new jsPDF()

      // Add background color
      doc.setFillColor(240, 249, 244)
      doc.rect(0, 0, 210, 297, "F")

      // Add header with styling
      doc.setFillColor(39, 174, 96)
      doc.rect(0, 0, 210, 40, "F")

      // Add title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("Air Quality Report", 105, 20, { align: "center" })

      // Add date
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${formatTime(new Date().toString())}`, 105, 30, { align: "center" })

      // Add data timestamp with styling
      doc.setTextColor(0, 0, 0)
      doc.setFillColor(220, 237, 225)
      doc.roundedRect(20, 50, 170, 15, 3, 3, "F")
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Data timestamp: ${formatTime(currentData.created_at)}`, 105, 60, { align: "center" })

      // Add readings section title
      doc.setFillColor(39, 174, 96)
      doc.setTextColor(255, 255, 255)
      doc.roundedRect(20, 75, 170, 12, 3, 3, "F")
      doc.setFontSize(14)
      doc.text("Current Readings", 105, 84, { align: "center" })

      // Add readings with styled boxes
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")

      let y = 95
      const boxHeight = 25
      const gap = 10

      // Temperature
      if (currentData.field1) {
        doc.setFillColor(230, 245, 235)
        doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
        doc.text("Temperature", 25, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field1}°C`, 75, y + 10)

        doc.setFillColor(230, 245, 235)
        doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.text("Humidity", 115, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field2 || "N/A"}%`, 165, y + 10)

        y += boxHeight + gap
      }

      // CO2
      if (currentData.field3) {
        doc.setFillColor(230, 245, 235)
        doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.text("CO₂ (MQ135)", 25, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field3} ppm`, 75, y + 10)

        doc.setFillColor(230, 245, 235)
        doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.text("LPG (MQ6)", 115, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field4 || "N/A"} ppm`, 165, y + 10)

        y += boxHeight + gap
      }

      // Propane & Butane
      if (currentData.field5) {
        doc.setFillColor(230, 245, 235)
        doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.text("Propane (MQ6)", 25, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field5} ppm`, 75, y + 10)

        doc.setFillColor(230, 245, 235)
        doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.text("Butane (MQ6)", 115, y + 10)
        doc.setFont("helvetica", "normal")
        doc.text(`${currentData.field6 || "N/A"} ppm`, 165, y + 10)

        y += boxHeight + gap
      }

      // Add AQI section
      y += 10
      doc.setFillColor(39, 174, 96)
      doc.setTextColor(255, 255, 255)
      doc.roundedRect(20, y, 170, 12, 3, 3, "F")
      doc.setFontSize(14)
      doc.text("Air Quality Index", 105, y + 9, { align: "center" })

      // Add AQI value
      y += 20
      const aqiValue = calculateAQI()
      let aqiColor, aqiCategory

      if (aqiValue <= 50) {
        aqiColor = [0, 228, 0] // Green
        aqiCategory = "Good"
      } else if (aqiValue <= 100) {
        aqiColor = [255, 255, 0] // Yellow
        aqiCategory = "Moderate"
      } else if (aqiValue <= 150) {
        aqiColor = [255, 126, 0] // Orange
        aqiCategory = "Unhealthy for Sensitive Groups"
      } else if (aqiValue <= 200) {
        aqiColor = [255, 0, 0] // Red
        aqiCategory = "Unhealthy"
      } else if (aqiValue <= 300) {
        aqiColor = [143, 63, 151] // Purple
        aqiCategory = "Very Unhealthy"
      } else {
        aqiColor = [126, 0, 35] // Maroon
        aqiCategory = "Hazardous"
      }

      doc.setFillColor(aqiColor[0], aqiColor[1], aqiColor[2])
      doc.roundedRect(50, y, 110, 30, 3, 3, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text(`AQI: ${aqiValue}`, 105, y + 15, { align: "center" })
      doc.setFontSize(12)
      doc.text(aqiCategory, 105, y + 25, { align: "center" })

      // Add footer
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Air Quality Monitor - Generated by your IoT device", 105, 280, { align: "center" })

      // Save the PDF
      doc.save("air-quality-report.pdf")

      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate AQI for PDF report
  const calculateAQI = () => {
    if (!currentData) return 0

    // Extract values from current data
    const co2 = currentData.field3 ? Number.parseFloat(currentData.field3) : 0
    const lpg = currentData.field4 ? Number.parseFloat(currentData.field4) : 0
    const propane = currentData.field5 ? Number.parseFloat(currentData.field5) : 0
    const butane = currentData.field6 ? Number.parseFloat(currentData.field6) : 0

    // Calculate a simplified AQI based on available gas readings
    let aqiValue = 0

    // CO2 contribution
    if (co2 < 400) aqiValue += 0
    else if (co2 < 1000) aqiValue += Math.round(((co2 - 400) / 600) * 50)
    else if (co2 < 2000) aqiValue += 50 + Math.round(((co2 - 1000) / 1000) * 50)
    else if (co2 < 5000) aqiValue += 100 + Math.round(((co2 - 2000) / 3000) * 100)
    else aqiValue += 200 + Math.round(((co2 - 5000) / 5000) * 100)

    // Gas contribution
    const gasAvg = (lpg + propane + butane) / 3
    if (gasAvg < 100) aqiValue += 0
    else if (gasAvg < 500) aqiValue += Math.round((gasAvg / 500) * 50)
    else if (gasAvg < 1000) aqiValue += 50 + Math.round(((gasAvg - 500) / 500) * 50)
    else if (gasAvg < 2000) aqiValue += 100 + Math.round(((gasAvg - 1000) / 1000) * 100)
    else aqiValue += 200 + Math.round(((gasAvg - 2000) / 3000) * 100)

    // Average the contributions and cap at 500
    return Math.min(500, Math.round(aqiValue / 2))
  }

  // Use the alert status from context to determine air quality status
  const getAirQualityStatus = () => {
    if (alertStatus.anyAlert) {
      return "critical"
    }

    // Check if any gas parameter exceeds warning threshold (excluding temperature)
    if (
      (currentData?.field3 && Number.parseFloat(currentData.field3) > 250) ||
      (currentData?.field4 && Number.parseFloat(currentData.field4) > 1000) ||
      (currentData?.field5 && Number.parseFloat(currentData.field5) > 200) ||
      (currentData?.field6 && Number.parseFloat(currentData.field6) > 200)
    ) {
      return "warning"
    }

    return "good"
  }

  useEffect(() => {
    // Request notification permission when component mounts
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold tracking-tight">Current Readings</h2>
        <p className="text-muted-foreground mt-2">Attempting to reconnect to the server...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Current Readings</h2>
          <p className="text-muted-foreground">
            Last updated: {loading ? "Loading..." : currentData ? formatTime(currentData.created_at) : "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={generatePDF} disabled={loading || !currentData}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {alertStatus.anyAlert && notificationSettings.enableAlerts && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Alert variant="destructive" className="animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Gas Level Alert!</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                {alertStatus.co2Alert && "CO₂ levels above 400ppm! "}
                {alertStatus.propaneAlert && "Propane levels above 200ppm! "}
                {alertStatus.butaneAlert && "Butane levels above 200ppm! "}
                Please take immediate action.
              </p>
              {!showEmergency && (
                <Button variant="destructive" className="w-fit mt-2" onClick={() => setShowEmergency(true)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Emergency Services
                </Button>
              )}
              {showEmergency && (
                <div className="bg-red-100 p-4 rounded-md mt-2">
                  <p className="font-bold">Emergency Contact</p>
                  <p>Call: 911 (US) / 112 (EU) / 999 (UK)</p>
                  <Button variant="outline" className="mt-2" onClick={() => setShowEmergency(false)}>
                    Close
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="col-span-1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AQIDisplay />
        </motion.div>

        <motion.div
          className="col-span-1 md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-100 shadow-sm h-full">
            <div className="flex flex-col md:flex-row items-center justify-between h-full">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  {getAirQualityStatus() === "critical" ? (
                    <span className="text-6xl">🤢</span>
                  ) : getAirQualityStatus() === "warning" ? (
                    <span className="text-6xl">😷</span>
                  ) : (
                    <span className="text-6xl">😊</span>
                  )}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">Air Quality Status</h3>
                  <p
                    className={`text-lg ${
                      alertStatus.anyAlert
                        ? "text-red-500"
                        : getAirQualityStatus() === "warning"
                          ? "text-yellow-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {alertStatus.anyAlert
                      ? "Critical - Take Action Now"
                      : getAirQualityStatus() === "warning"
                        ? "Warning - Needs Attention"
                        : "Good - Normal Levels"}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-white p-3 rounded-lg shadow-sm">
                <p>
                  Monitoring active for: <span className="font-medium">24 hours</span>
                </p>
                <p>
                  Device ID: <span className="font-medium">AQM-2943472</span>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="col-span-1 md:col-span-3">
          <ParameterGrid />
        </div>

        <Card className="col-span-1 md:col-span-3 border-emerald-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white p-1 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </span>
              Recommendations
            </CardTitle>
            <CardDescription>Based on current air quality readings</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Recommendations airQualityStatus={getAirQualityStatus()} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
