"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function AirQualityEmoji({ status, className }) {
  const [emoji, setEmoji] = useState("😊")
  const [animation, setAnimation] = useState("")

  useEffect(() => {
    // Set emoji based on status
    switch (status) {
      case "good":
        setEmoji("😊")
        setAnimation("animate-bounce")
        break
      case "warning":
        setEmoji("😷")
        setAnimation("animate-pulse")
        break
      case "critical":
        setEmoji("🤢")
        setAnimation("animate-shake")
        break
      default:
        setEmoji("😐")
        setAnimation("")
    }

    // Always animate when status changes
    const timer = setTimeout(() => {
      setAnimation("")
    }, 3000)

    return () => clearTimeout(timer)
  }, [status])

  return <div className={cn("text-4xl", animation, className)}>{emoji}</div>
}
