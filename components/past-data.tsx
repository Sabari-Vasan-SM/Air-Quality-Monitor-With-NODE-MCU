"use client"

// Update the PastData component with enhanced chart UI
import { useState, useRef } from "react"
import { useThingSpeak } from "@/components/thingspeak-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, BarChart3, PieChartIcon, LineChart, TrendingUp, Layers } from "lucide-react"
import { jsPDF } from "jspdf"
import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  Rectangle,
  Scatter,
  ScatterChart,
  ZAxis,
  ComposedChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function PastData() {
  const { historicalData, loading, fetchHistoricalData } = useThingSpeak()
  const [timeRange, setTimeRange] = useState("7")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartType, setChartType] = useState("temperature")
  const [visualizationType, setVisualizationType] = useState("line")
  const [showAllParameters, setShowAllParameters] = useState(false)
  const chartContainerRef = useRef(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchHistoricalData(Number.parseInt(timeRange))
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleTimeRangeChange = async (value) => {
    setTimeRange(value)
    await fetchHistoricalData(Number.parseInt(value))
  }

  const generatePDF = () => {
    if (historicalData.length === 0) return

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
      doc.text("Air Quality Historical Report", 105, 20, { align: "center" })

      // Add date
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: "center" })

      // Add time range with styling
      doc.setTextColor(0, 0, 0)
      doc.setFillColor(220, 237, 225)
      doc.roundedRect(20, 50, 170, 15, 3, 3, "F")
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Time Range: Last ${timeRange} days`, 105, 60, { align: "center" })

      // Add summary section title
      doc.setFillColor(39, 174, 96)
      doc.setTextColor(255, 255, 255)
      doc.roundedRect(20, 75, 170, 12, 3, 3, "F")
      doc.setFontSize(14)
      doc.text("Data Summary", 105, 84, { align: "center" })

      // Add summary with styled boxes
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)

      // Calculate averages
      const averages = calculateAverages()

      let y = 95
      const boxHeight = 25
      const gap = 10

      // Temperature & Humidity
      doc.setFillColor(230, 245, 235)
      doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. Temperature", 25, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.temperature.toFixed(1)}°C`, 75, y + 10)

      doc.setFillColor(230, 245, 235)
      doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. Humidity", 115, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.humidity.toFixed(1)}%`, 165, y + 10)

      y += boxHeight + gap

      // CO2 & LPG
      doc.setFillColor(230, 245, 235)
      doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. CO₂", 25, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.co2.toFixed(0)} ppm`, 75, y + 10)

      doc.setFillColor(230, 245, 235)
      doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. LPG", 115, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.lpg.toFixed(1)} ppm`, 165, y + 10)

      y += boxHeight + gap

      // Propane & Butane
      doc.setFillColor(230, 245, 235)
      doc.roundedRect(20, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. Propane", 25, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.propane.toFixed(1)} ppm`, 75, y + 10)

      doc.setFillColor(230, 245, 235)
      doc.roundedRect(110, y, 80, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Avg. Butane", 115, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${averages.butane.toFixed(0)} ppm`, 165, y + 10)

      y += boxHeight + gap + 10

      // Add data points info
      doc.setFillColor(220, 237, 225)
      doc.roundedRect(20, y, 170, boxHeight, 3, 3, "F")
      doc.setFont("helvetica", "bold")
      doc.text("Total data points:", 25, y + 10)
      doc.setFont("helvetica", "normal")
      doc.text(`${historicalData.length}`, 75, y + 10)

      doc.setFont("helvetica", "bold")
      doc.text("Date range:", 115, y + 10)
      doc.setFont("helvetica", "normal")
      const startDate = new Date(historicalData[0]?.created_at).toLocaleDateString()
      const endDate = new Date(historicalData[historicalData.length - 1]?.created_at).toLocaleDateString()
      doc.text(`${startDate} to ${endDate}`, 165, y + 10)

      // Add footer
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Air Quality Monitor - Historical Data Report", 105, 280, { align: "center" })

      // Save the PDF
      doc.save("air-quality-historical-report.pdf")

      toast({
        title: "PDF Generated",
        description: "Your historical report has been downloaded successfully.",
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

  const calculateAverages = () => {
    if (historicalData.length === 0) return {}

    const sums = {
      temperature: 0,
      humidity: 0,
      co2: 0,
      lpg: 0,
      propane: 0,
      butane: 0,
    }

    const counts = {
      temperature: 0,
      humidity: 0,
      co2: 0,
      lpg: 0,
      propane: 0,
      butane: 0,
    }

    historicalData.forEach((data) => {
      if (data.field1) {
        sums.temperature += Number.parseFloat(data.field1)
        counts.temperature++
      }
      if (data.field2) {
        sums.humidity += Number.parseFloat(data.field2)
        counts.humidity++
      }
      if (data.field3) {
        sums.co2 += Number.parseFloat(data.field3)
        counts.co2++
      }
      if (data.field4) {
        sums.lpg += Number.parseFloat(data.field4)
        counts.lpg++
      }
      if (data.field5) {
        sums.propane += Number.parseFloat(data.field5)
        counts.propane++
      }
      if (data.field6) {
        sums.butane += Number.parseFloat(data.field6)
        counts.butane++
      }
    })

    return {
      temperature: counts.temperature > 0 ? sums.temperature / counts.temperature : 0,
      humidity: counts.humidity > 0 ? sums.humidity / counts.humidity : 0,
      co2: counts.co2 > 0 ? sums.co2 / counts.co2 : 0,
      lpg: counts.lpg > 0 ? sums.lpg / counts.lpg : 0,
      propane: counts.propane > 0 ? sums.propane / counts.propane : 0,
      butane: counts.butane > 0 ? sums.butane / counts.butane : 0,
    }
  }

  // Prepare data for charts - reduce data points for better readability
  const prepareChartData = () => {
    // Take a smaller subset of data to make the chart more readable
    const dataSubset = historicalData.filter((_, index) => index % Math.ceil(historicalData.length / 50) === 0)

    return dataSubset.map((data) => ({
      time: new Date(data.created_at).toLocaleString([], {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(data.created_at).getTime(),
      temperature: data.field1 ? Number.parseFloat(data.field1) : null,
      humidity: data.field2 ? Number.parseFloat(data.field2) : null,
      co2: data.field3 ? Number.parseFloat(data.field3) : null,
      lpg: data.field4 ? Number.parseFloat(data.field4) : null,
      propane: data.field5 ? Number.parseFloat(data.field5) : null,
      butane: data.field6 ? Number.parseFloat(data.field6) : null,
    }))
  }

  // Prepare data for pie chart
  const preparePieData = () => {
    const averages = calculateAverages()

    switch (chartType) {
      case "temperature":
        return [
          {
            name: "Below 20°C",
            value: historicalData.filter((d) => d.field1 && Number.parseFloat(d.field1) < 20).length,
          },
          {
            name: "20-25°C",
            value: historicalData.filter(
              (d) => d.field1 && Number.parseFloat(d.field1) >= 20 && Number.parseFloat(d.field1) < 25,
            ).length,
          },
          {
            name: "25-30°C",
            value: historicalData.filter(
              (d) => d.field1 && Number.parseFloat(d.field1) >= 25 && Number.parseFloat(d.field1) < 30,
            ).length,
          },
          {
            name: "Above 30°C",
            value: historicalData.filter((d) => d.field1 && Number.parseFloat(d.field1) >= 30).length,
          },
        ]
      case "humidity":
        return [
          {
            name: "Below 30%",
            value: historicalData.filter((d) => d.field2 && Number.parseFloat(d.field2) < 30).length,
          },
          {
            name: "30-50%",
            value: historicalData.filter(
              (d) => d.field2 && Number.parseFloat(d.field2) >= 30 && Number.parseFloat(d.field2) < 50,
            ).length,
          },
          {
            name: "50-70%",
            value: historicalData.filter(
              (d) => d.field2 && Number.parseFloat(d.field2) >= 50 && Number.parseFloat(d.field2) < 70,
            ).length,
          },
          {
            name: "Above 70%",
            value: historicalData.filter((d) => d.field2 && Number.parseFloat(d.field2) >= 70).length,
          },
        ]
      case "co2":
        return [
          {
            name: "Below 200 ppm",
            value: historicalData.filter((d) => d.field3 && Number.parseFloat(d.field3) < 200).length,
          },
          {
            name: "200-250 ppm",
            value: historicalData.filter(
              (d) => d.field3 && Number.parseFloat(d.field3) >= 200 && Number.parseFloat(d.field3) < 250,
            ).length,
          },
          {
            name: "250-1000 ppm",
            value: historicalData.filter(
              (d) => d.field3 && Number.parseFloat(d.field3) >= 250 && Number.parseFloat(d.field3) < 1000,
            ).length,
          },
          {
            name: "Above 1000 ppm",
            value: historicalData.filter((d) => d.field3 && Number.parseFloat(d.field3) >= 1000).length,
          },
        ]
      case "lpg":
        return [
          {
            name: "Below 500 ppm",
            value: historicalData.filter((d) => d.field4 && Number.parseFloat(d.field4) < 500).length,
          },
          {
            name: "500-1000 ppm",
            value: historicalData.filter(
              (d) => d.field4 && Number.parseFloat(d.field4) >= 500 && Number.parseFloat(d.field4) < 1000,
            ).length,
          },
          {
            name: "1000-2000 ppm",
            value: historicalData.filter(
              (d) => d.field4 && Number.parseFloat(d.field4) >= 1000 && Number.parseFloat(d.field4) < 2000,
            ).length,
          },
          {
            name: "Above 2000 ppm",
            value: historicalData.filter((d) => d.field4 && Number.parseFloat(d.field4) >= 2000).length,
          },
        ]
      case "propane":
        return [
          {
            name: "Below 100 ppm",
            value: historicalData.filter((d) => d.field5 && Number.parseFloat(d.field5) < 100).length,
          },
          {
            name: "100-200 ppm",
            value: historicalData.filter(
              (d) => d.field5 && Number.parseFloat(d.field5) >= 100 && Number.parseFloat(d.field5) < 200,
            ).length,
          },
          {
            name: "200-500 ppm",
            value: historicalData.filter(
              (d) => d.field5 && Number.parseFloat(d.field5) >= 200 && Number.parseFloat(d.field5) < 500,
            ).length,
          },
          {
            name: "Above 500 ppm",
            value: historicalData.filter((d) => d.field5 && Number.parseFloat(d.field5) >= 500).length,
          },
        ]
      case "butane":
        return [
          {
            name: "Below 100 ppm",
            value: historicalData.filter((d) => d.field6 && Number.parseFloat(d.field6) < 100).length,
          },
          {
            name: "100-200 ppm",
            value: historicalData.filter(
              (d) => d.field6 && Number.parseFloat(d.field6) >= 100 && Number.parseFloat(d.field6) < 200,
            ).length,
          },
          {
            name: "200-500 ppm",
            value: historicalData.filter(
              (d) => d.field6 && Number.parseFloat(d.field6) >= 200 && Number.parseFloat(d.field6) < 500,
            ).length,
          },
          {
            name: "Above 500 ppm",
            value: historicalData.filter((d) => d.field6 && Number.parseFloat(d.field6) >= 500).length,
          },
        ]
      default:
        return []
    }
  }

  // Prepare data for all parameters view
  const prepareAllParametersData = () => {
    // Take a smaller subset of data to make the chart more readable
    const dataSubset = historicalData.filter((_, index) => index % Math.ceil(historicalData.length / 30) === 0)

    return dataSubset.map((data) => ({
      time: new Date(data.created_at).toLocaleString([], {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(data.created_at).getTime(),
      temperature: data.field1 ? Number.parseFloat(data.field1) : null,
      humidity: data.field2 ? Number.parseFloat(data.field2) : null,
      co2: data.field3 ? Number.parseFloat(data.field3) / 10 : null, // Scale down for better visualization
      lpg: data.field4 ? Number.parseFloat(data.field4) / 20 : null, // Scale down for better visualization
      propane: data.field5 ? Number.parseFloat(data.field5) / 20 : null, // Scale down for better visualization
      butane: data.field6 ? Number.parseFloat(data.field6) / 20 : null, // Scale down for better visualization
    }))
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  const GAS_COLORS = {
    co2: "#FF8042",
    lpg: "#FFBB28",
    propane: "#00C49F",
    butane: "#0088FE",
  }

  // Custom tooltip for all parameters view
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => {
              // Get original value for scaled parameters
              let value = entry.value
              let unit = ""

              if (entry.name === "co2") {
                value = value * 10
                unit = " ppm"
              } else if (["lpg", "propane", "butane"].includes(entry.name)) {
                value = value * 20
                unit = " ppm"
              } else if (entry.name === "temperature") {
                unit = "°C"
              } else if (entry.name === "humidity") {
                unit = "%"
              }

              return (
                <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
                  {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {value.toFixed(1)}
                  {unit}
                </p>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  // Function to get chart label
  function getChartLabel(type) {
    switch (type) {
      case "temperature":
        return "Temperature (°C)"
      case "humidity":
        return "Humidity (%)"
      case "co2":
        return "CO₂ (MQ135) (ppm)"
      case "lpg":
        return "LPG (MQ6) (ppm)"
      case "propane":
        return "Propane (MQ6) (ppm)"
      case "butane":
        return "Butane (MQ6) (ppm)"
      default:
        return type
    }
  }

  // Function to get chart color
  function getChartColor(type) {
    switch (type) {
      case "temperature":
        return "#FF5733"
      case "humidity":
        return "#3498DB"
      case "co2":
        return "#FF8042"
      case "lpg":
        return "#FFBB28"
      case "propane":
        return "#00C49F"
      case "butane":
        return "#0088FE"
      default:
        return "#8884d8"
    }
  }

  // Animation variants for motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historical Data</h2>
          <p className="text-muted-foreground">View and analyze past air quality readings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="3">Last 3 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={generatePDF} disabled={loading || historicalData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white p-1 rounded-full">
                <BarChart3 className="h-4 w-4" />
              </span>
              Data Visualization
            </CardTitle>
            <CardDescription>Select parameter and visualization type</CardDescription>

            <Tabs defaultValue="single" className="mt-4">
              <TabsList className="mb-4 bg-white/70">
                <TabsTrigger value="single" onClick={() => setShowAllParameters(false)}>
                  Single Parameter
                </TabsTrigger>
                <TabsTrigger value="all" onClick={() => setShowAllParameters(true)}>
                  All Parameters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="co2">CO₂ (MQ135)</SelectItem>
                      <SelectItem value="lpg">LPG (MQ6)</SelectItem>
                      <SelectItem value="propane">Propane (MQ6)</SelectItem>
                      <SelectItem value="butane">Butane (MQ6)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex rounded-md overflow-hidden border border-input">
                    <Button
                      variant={visualizationType === "line" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "line" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("line")}
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Line
                    </Button>
                    <Button
                      variant={visualizationType === "bar" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "bar" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("bar")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Bar
                    </Button>
                    <Button
                      variant={visualizationType === "pie" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "pie" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("pie")}
                    >
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      Pie
                    </Button>
                    <Button
                      variant={visualizationType === "scatter" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "scatter" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("scatter")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Scatter
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="all">
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="flex rounded-md overflow-hidden border border-input">
                    <Button
                      variant={visualizationType === "line" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "line" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("line")}
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Line
                    </Button>
                    <Button
                      variant={visualizationType === "area" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "area" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("area")}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Area
                    </Button>
                    <Button
                      variant={visualizationType === "composed" ? "default" : "ghost"}
                      className={`flex-1 rounded-none ${visualizationType === "composed" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                      onClick={() => setVisualizationType("composed")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Composed
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="h-[500px] pt-4" ref={chartContainerRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading data...</p>
              </div>
            ) : historicalData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p>No historical data available</p>
              </div>
            ) : showAllParameters ? (
              // All parameters view
              <div className="h-full">
                {visualizationType === "line" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareAllParametersData()} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={Math.ceil(prepareAllParametersData().length / 10)}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[0, 100]}
                        label={{ value: "Temp (°C) / Humidity (%)", angle: -90, position: "insideLeft" }}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        label={{ value: "Gas Levels (scaled)", angle: 90, position: "insideRight" }}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />

                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#FF5733"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Temperature"
                      />
                      <Line
                        yAxisId="left"
                        stroke="#FF5733"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Temperature"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3498DB"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Humidity"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="co2"
                        stroke="#FF8042"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="CO₂"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="lpg"
                        stroke="#FFBB28"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="LPG"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="propane"
                        stroke="#00C49F"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Propane"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="butane"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Butane"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {visualizationType === "area" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={prepareAllParametersData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={Math.ceil(prepareAllParametersData().length / 10)}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[0, 100]}
                        label={{ value: "Temp (°C) / Humidity (%)", angle: -90, position: "insideLeft" }}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        label={{ value: "Gas Levels (scaled)", angle: 90, position: "insideRight" }}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />

                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        fill="#FF5733"
                        stroke="#FF5733"
                        fillOpacity={0.6}
                        name="Temperature"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="humidity"
                        fill="#3498DB"
                        stroke="#3498DB"
                        fillOpacity={0.6}
                        name="Humidity"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="co2"
                        fill="#FF8042"
                        stroke="#FF8042"
                        fillOpacity={0.6}
                        name="CO₂"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="lpg"
                        fill="#FFBB28"
                        stroke="#FFBB28"
                        fillOpacity={0.6}
                        name="LPG"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="propane"
                        fill="#00C49F"
                        stroke="#00C49F"
                        fillOpacity={0.6}
                        name="Propane"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="butane"
                        fill="#0088FE"
                        stroke="#0088FE"
                        fillOpacity={0.6}
                        name="Butane"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {visualizationType === "composed" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={prepareAllParametersData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={Math.ceil(prepareAllParametersData().length / 10)}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[0, 100]}
                        label={{ value: "Temp (°C) / Humidity (%)", angle: -90, position: "insideLeft" }}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        label={{ value: "Gas Levels (scaled)", angle: 90, position: "insideRight" }}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />

                      <Bar yAxisId="left" dataKey="temperature" fill="#FF5733" name="Temperature" barSize={20} />
                      <Bar yAxisId="left" dataKey="humidity" fill="#3498DB" name="Humidity" barSize={20} />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="co2"
                        stroke="#FF8042"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="CO₂"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="lpg"
                        stroke="#FFBB28"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="LPG"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="propane"
                        stroke="#00C49F"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Propane"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="butane"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Butane"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : visualizationType === "line" ? (
              <ChartContainer
                config={{
                  [chartType]: {
                    label: getChartLabel(chartType),
                    color: getChartColor(chartType),
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getChartColor(chartType)} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={getChartColor(chartType)} stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="time"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10 }}
                      interval={Math.ceil(prepareChartData().length / 10)}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey={chartType}
                      stroke={getChartColor(chartType)}
                      activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                      strokeWidth={3}
                      dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartType}
                      stroke="none"
                      fillOpacity={0.2}
                      fill="url(#colorGradient)"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : visualizationType === "bar" ? (
              <ChartContainer
                config={{
                  [chartType]: {
                    label: getChartLabel(chartType),
                    color: getChartColor(chartType),
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getChartColor(chartType)} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={getChartColor(chartType)} stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="time"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10 }}
                      interval={Math.ceil(prepareChartData().length / 10)}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                    <Bar
                      dataKey={chartType}
                      fill="url(#barGradient)"
                      activeBar={<Rectangle fill={getChartColor(chartType)} stroke="#fff" />}
                      animationDuration={1500}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : visualizationType === "scatter" ? (
              <ChartContainer
                config={{
                  [chartType]: {
                    label: getChartLabel(chartType),
                    color: getChartColor(chartType),
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      type="number"
                      dataKey="timestamp"
                      name="Time"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis type="number" dataKey={chartType} name={getChartLabel(chartType)} tick={{ fontSize: 10 }} />
                    <ZAxis range={[50, 400]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => [value, getChartLabel(chartType)]}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                    <Scatter
                      name={getChartLabel(chartType)}
                      data={prepareChartData()}
                      fill={getChartColor(chartType)}
                      shape="circle"
                      animationDuration={1500}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={180}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={0}
                    paddingAngle={2}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#pieGradient${index % COLORS.length})`}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} readings`, "Count"]} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-emerald-100 shadow-sm">
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
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </span>
              Data Summary
            </CardTitle>
            <CardDescription>Statistical summary of historical data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p>Loading data...</p>
            ) : historicalData.length === 0 ? (
              <p>No historical data available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryItem
                  title="Temperature"
                  value={calculateAverages().temperature.toFixed(1)}
                  unit="°C"
                  count={historicalData.filter((d) => d.field1).length}
                  icon="🌡️"
                  color="bg-gradient-to-r from-red-50 to-orange-50"
                  iconBg="bg-red-500"
                />
                <SummaryItem
                  title="Humidity"
                  value={calculateAverages().humidity.toFixed(1)}
                  unit="%"
                  count={historicalData.filter((d) => d.field2).length}
                  icon="💧"
                  color="bg-gradient-to-r from-blue-50 to-indigo-50"
                  iconBg="bg-blue-500"
                />
                <SummaryItem
                  title="CO₂ (MQ135)"
                  value={calculateAverages().co2.toFixed(0)}
                  unit="ppm"
                  count={historicalData.filter((d) => d.field3).length}
                  icon="🌬️"
                  color="bg-gradient-to-r from-emerald-50 to-green-50"
                  iconBg="bg-emerald-500"
                />
                <SummaryItem
                  title="LPG (MQ6)"
                  value={calculateAverages().lpg.toFixed(1)}
                  unit="ppm"
                  count={historicalData.filter((d) => d.field4).length}
                  icon="🔥"
                  color="bg-gradient-to-r from-orange-50 to-amber-50"
                  iconBg="bg-orange-500"
                />
                <SummaryItem
                  title="Propane (MQ6)"
                  value={calculateAverages().propane.toFixed(1)}
                  unit="ppm"
                  count={historicalData.filter((d) => d.field5).length}
                  icon="💨"
                  color="bg-gradient-to-r from-yellow-50 to-amber-50"
                  iconBg="bg-yellow-500"
                />
                <SummaryItem
                  title="Butane (MQ6)"
                  value={calculateAverages().butane.toFixed(0)}
                  unit="ppm"
                  count={historicalData.filter((d) => d.field6).length}
                  icon="🧪"
                  color="bg-gradient-to-r from-red-50 to-rose-50"
                  iconBg="bg-red-500"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function SummaryItem({ title, value, unit, count, icon, color, iconBg }) {
  return (
    <motion.div
      className={`p-4 rounded-lg border border-gray-100 shadow-sm ${color}`}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`${iconBg} text-white p-2 rounded-full`}>
          <span className="text-lg">{icon}</span>
        </div>
        <h3 className="font-medium text-base">{title}</h3>
      </div>
      <p className="text-2xl font-bold mt-1">
        {value} {unit}
      </p>
      <p className="text-sm text-muted-foreground mt-1">Average from {count} readings</p>
    </motion.div>
  )
}

function getChartLabel(type) {
  switch (type) {
    case "temperature":
      return "Temperature (°C)"
    case "humidity":
      return "Humidity (%)"
    case "co2":
      return "CO₂ (MQ135) (ppm)"
    case "lpg":
      return "LPG (MQ6) (ppm)"
    case "propane":
      return "Propane (MQ6) (ppm)"
    case "butane":
      return "Butane (MQ6) (ppm)"
    default:
      return type
  }
}
