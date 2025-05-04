"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useThingSpeak } from "@/components/thingspeak-context"
import HeatMap from "@/components/heat-map"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SwipeableTiles() {
  const { currentData, loading } = useThingSpeak()
  const [currentPage, setCurrentPage] = useState(0)
  const constraintsRef = useRef(null)

  // Define thresholds for parameters
  const thresholds = {
    temperature: { warning: 30, critical: 35 }, // °C
    humidity: { warning: 70, critical: 85 }, // %
    co2: { warning: 250, critical: 1000 }, // ppm
    lpg: { warning: 1000, critical: 2000 }, // ppm
    propane: { warning: 200, critical: 1000 }, // ppm
    butane: { warning: 200, critical: 1000 }, // ppm
  }

  // Group parameters into pages (2 per page)
  const pages = [
    [
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
    ],
    [
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
    ],
    [
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
    ],
  ]

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length)
  }

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 100) {
      prevPage()
    } else if (info.offset.x < -100) {
      nextPage()
    }
  }

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentPage * 100 + "%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex w-[300%]"
      >
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="w-full px-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.map((item, itemIndex) => (
                <motion.div
                  key={`${pageIndex}-${itemIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: itemIndex * 0.1 }}
                >
                  <HeatMap {...item} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-4 gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentPage === index ? "bg-emerald-500 w-6" : "bg-gray-300"
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm z-10"
        onClick={prevPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm z-10"
        onClick={nextPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
