"use client"

import { useState, useEffect } from "react"
import { useThingSpeak } from "@/components/thingspeak-context"
import { cn } from "@/lib/utils"

export default function StatusEmoji({ className }) {
  const [emoji, setEmoji] = useState("😊")
  const [animation, setAnimation] = useState("")
  const { currentData, loading, alertStatus } = useThingSpeak()

  useEffect(() => {
    if (loading || !currentData) return

    // Set emoji based on alert status
    if (alertStatus.anyAlert) {
      setEmoji("🤢")
      setAnimation("animate-pulse")
    } else {
      // Define thresholds
      const thresholds = {
        co2: { warning: 250, critical: 1000 }, // ppm
        lpg: { warning: 1000, critical: 2000 }, // ppm
        propane: { warning: 200, critical: 1000 }, // ppm
        butane: { warning: 200, critical: 1000 }, // ppm
      }

      // Check if any parameter exceeds warning threshold
      const isWarning =
        (currentData.field3 && Number.parseFloat(currentData.field3) > thresholds.co2.warning) ||
        (currentData.field4 && Number.parseFloat(currentData.field4) > thresholds.lpg.warning) ||
        (currentData.field5 && Number.parseFloat(currentData.field5) > thresholds.propane.warning) ||
        (currentData.field6 && Number.parseFloat(currentData.field6) > thresholds.butane.warning)

      if (isWarning) {
        setEmoji("😷")
        setAnimation("animate-pulse")
      } else {
        setEmoji("😊")
        setAnimation("animate-bounce")
      }
    }

    // Clear animation after 3 seconds
    const timer = setTimeout(() => {
      setAnimation("")
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentData, loading, alertStatus])

  return <div className={cn("text-5xl mb-4", animation, className)}>{emoji}</div>
}
