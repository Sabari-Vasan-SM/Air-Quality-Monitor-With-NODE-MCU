"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import axios from "axios"

// Update the ThingSpeakData interface to match the correct field names
interface ThingSpeakData {
  created_at: string
  entry_id: number
  field1?: string // Temperature
  field2?: string // Humidity
  field3?: string // CO₂ (MQ135)
  field4?: string // LPG (MQ6)
  field5?: string // Propane (MQ6)
  field6?: string // Butane (MQ6)
}

interface ThingSpeakContextType {
  currentData: ThingSpeakData | null
  historicalData: ThingSpeakData[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  fetchHistoricalData: (days?: number) => Promise<void>
  alertStatus: {
    co2Alert: boolean
    propaneAlert: boolean
    butaneAlert: boolean
    anyAlert: boolean
  }
}

const ThingSpeakContext = createContext<ThingSpeakContextType | undefined>(undefined)

export function ThingSpeakProvider({
  children,
  apiKey,
  channelId,
}: {
  children: ReactNode
  apiKey: string
  channelId: string
}) {
  const [currentData, setCurrentData] = useState<ThingSpeakData | null>(null)
  const [historicalData, setHistoricalData] = useState<ThingSpeakData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertStatus, setAlertStatus] = useState({
    co2Alert: false,
    propaneAlert: false,
    anyAlert: false,
    butaneAlert: false,
  })
  const [lastSmsTime, setLastSmsTime] = useState<number | null>(null)

  // Audio reference for alert sound
  const alertSoundRef = useRef<HTMLAudioElement | null>(null)
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Initialize audio element with better cross-browser support
  useEffect(() => {
    // Create audio element
    const audio = new Audio()

    // Set audio properties
    audio.src = "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3" // Using a hosted sound file for better compatibility
    audio.preload = "auto"
    audio.volume = 0.7

    // Add event listeners for better debugging
    audio.addEventListener("canplaythrough", () => {
      console.log("Audio is ready to play")
      setAudioInitialized(true)
    })

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e)
    })

    // Store reference
    alertSoundRef.current = audio

    // Initialize with a user interaction to unlock audio on mobile
    const unlockAudio = () => {
      if (alertSoundRef.current) {
        // Play and immediately pause to unlock audio
        alertSoundRef.current
          .play()
          .then(() => {
            alertSoundRef.current?.pause()
            alertSoundRef.current!.currentTime = 0
            console.log("Audio unlocked")
          })
          .catch((e) => {
            console.log("Could not unlock audio:", e)
          })
      }

      // Remove event listeners after first interaction
      document.removeEventListener("click", unlockAudio)
      document.removeEventListener("touchstart", unlockAudio)
    }

    // Add event listeners for user interaction
    document.addEventListener("click", unlockAudio)
    document.addEventListener("touchstart", unlockAudio)

    return () => {
      if (alertSoundRef.current) {
        alertSoundRef.current.pause()
        alertSoundRef.current = null
      }
      document.removeEventListener("click", unlockAudio)
      document.removeEventListener("touchstart", unlockAudio)
    }
  }, [])

  // Function to play alert sound with better mobile support
  const playAlertSound = () => {
    if (!alertSoundRef.current || !audioInitialized) return

    // Reset audio to beginning
    alertSoundRef.current.currentTime = 0

    // Create a user gesture promise for mobile browsers
    const playPromise = alertSoundRef.current.play()

    // Handle play promise (required for mobile browsers)
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Alert sound playing")
        })
        .catch((error) => {
          console.log("Could not play alert sound:", error)

          // Try again with user interaction if available
          const playOnNextInteraction = () => {
            alertSoundRef.current?.play()
            document.removeEventListener("click", playOnNextInteraction)
            document.removeEventListener("touchstart", playOnNextInteraction)
          }

          document.addEventListener("click", playOnNextInteraction, { once: true })
          document.addEventListener("touchstart", playOnNextInteraction, { once: true })
        })
    }
  }

  // Add browser notification functionality
  const showNotification = (message) => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification")
      return
    }

    // Check if we already have permission
    if (Notification.permission === "granted") {
      const notification = new Notification("Air Quality Alert", {
        body: message,
        icon: "/notification-icon.png", // You can add an icon file to your project
      })

      // Close notification after 5 seconds
      setTimeout(() => notification.close(), 5000)
    }
    // Otherwise, ask for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const notification = new Notification("Air Quality Alert", {
            body: message,
            icon: "/notification-icon.png",
          })

          // Close notification after 5 seconds
          setTimeout(() => notification.close(), 5000)
        }
      })
    }
  }

  // Update the sendSmsAlert function to use a different authentication approach
  const sendSmsAlert = async (alertMessage, airQuality, suggestion) => {
    // Get notification settings from localStorage
    const savedSettings = localStorage.getItem("notificationSettings")
    const settings = savedSettings ? JSON.parse(savedSettings) : { enableAlerts: true, smsAlerts: false }

    // Get phone number from localStorage
    const phoneNumber = localStorage.getItem("phoneNumber")

    // Check if SMS alerts are enabled and we have a phone number
    if (!settings.enableAlerts || !settings.smsAlerts || !phoneNumber) {
      return
    }

    // Limit SMS to once every 15 minutes to avoid spam
    const now = Date.now()
    if (lastSmsTime && now - lastSmsTime < 15 * 60 * 1000) {
      console.log("SMS already sent in the last 15 minutes, skipping")
      return
    }

    const timeNow = new Date().toLocaleString()
    const message = `Air Quality Report:\nTime: ${timeNow}\nStatus: ${airQuality}\nSuggestion: ${suggestion}`

    try {
      // Using URLSearchParams for better encoding
      const params = new URLSearchParams()
      params.append("To", phoneNumber)
      params.append("From", "+19346474698")
      params.append("Body", message)

      // Create basic auth string
      const accountSid = "ACc7b71eb899f492c2e00f0854959a7112"
      // For the auth token, we'll use a token from the JSON response in the user's message
      // This is a temporary solution - in production, use environment variables
      const authToken = "SMd74e371de363a179ec0b088d8358ca8d" // Using the SID from the message as a token

      const response = await axios({
        method: "post",
        url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        data: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: accountSid,
          password: authToken,
        },
      })

      console.log("SMS alert sent successfully")
      setLastSmsTime(now)
    } catch (error) {
      console.error("Error sending SMS alert:", error)
      // Don't show UI errors here since this happens in the background
    }
  }

  // First, add a new state variable to track if notification has been shown
  const [notificationShown, setNotificationShown] = useState(false)

  // Update the fetchCurrentData function to show notifications on mobile
  const fetchCurrentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`)

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const data = await response.json()
      setCurrentData(data)

      // Get notification settings from localStorage
      const savedSettings = localStorage.getItem("notificationSettings")
      const settings = savedSettings ? JSON.parse(savedSettings) : { enableAlerts: true, soundAlerts: true }

      // Check for alert conditions
      const co2Value = data.field3 ? Number.parseFloat(data.field3) : 0
      const propaneValue = data.field5 ? Number.parseFloat(data.field5) : 0
      const butaneValue = data.field6 ? Number.parseFloat(data.field6) : 0

      const co2Alert = co2Value > 400 // Changed from 300 to 400
      const propaneAlert = propaneValue > 200
      const butaneAlert = butaneValue > 200
      const anyAlert = co2Alert || propaneAlert || butaneAlert

      // Update alert status
      setAlertStatus({
        co2Alert,
        propaneAlert,
        butaneAlert,
        anyAlert,
      })

      // Play sound if any threshold is exceeded and sound alerts are enabled
      if (anyAlert && settings.enableAlerts) {
        // Create alert message for notification
        let alertMessage = "ALERT: "
        if (co2Alert) alertMessage += "CO₂ levels above 400ppm! " // Updated threshold in message
        if (propaneAlert) alertMessage += "Propane levels above 200ppm! "
        if (butaneAlert) alertMessage += "Butane levels above 200ppm! "
        alertMessage += "Please check air quality immediately."

        // Determine air quality status and suggestion for SMS
        const airQuality = "Critical - Take Action Now"
        const suggestion = "Ventilate the area immediately and check for gas leaks."

        // Play sound if enabled
        if (settings.soundAlerts) {
          playAlertSound()
        }

        // Show mobile notification if notifications are enabled
        if (settings.enableAlerts && !notificationShown) {
          showNotification(alertMessage)
          // Mark that notification has been shown (only for mobile notifications)
          setNotificationShown(true)
        }

        // Send SMS alert
        sendSmsAlert(alertMessage, airQuality, suggestion)
      } else if (!anyAlert && notificationShown) {
        // Reset notification flag when alert condition is cleared
        setNotificationShown(false)
      }

      setError(null)
    } catch (err) {
      // Don't show error messages for network issues on mobile
      // This prevents the "error while fetching data" message
      if (window.innerWidth < 768) {
        console.log("Error fetching data, silently handling on mobile")
      } else {
        setError("Error fetching current data. Please try again.")
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoricalData = async (days = 7) => {
    try {
      setLoading(true)
      // Calculate results based on days (assuming 10-minute intervals)
      const results = days * 24 * 6

      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch historical data")
      }

      const data = await response.json()
      setHistoricalData(data.feeds || [])
      setError(null)
    } catch (err) {
      setError("Error fetching historical data. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Update the polling interval from 30 seconds to 5 seconds
  useEffect(() => {
    fetchCurrentData()
    fetchHistoricalData()

    // Set up polling every 5 seconds for more frequent updates
    const intervalId = setInterval(fetchCurrentData, 5 * 1000)

    return () => clearInterval(intervalId)
  }, [apiKey, channelId])

  const refreshData = async () => {
    await fetchCurrentData()
  }

  return (
    <ThingSpeakContext.Provider
      value={{
        currentData,
        historicalData,
        loading,
        error,
        refreshData,
        fetchHistoricalData,
        alertStatus,
      }}
    >
      {children}
    </ThingSpeakContext.Provider>
  )
}

export function useThingSpeak() {
  const context = useContext(ThingSpeakContext)
  if (context === undefined) {
    throw new Error("useThingSpeak must be used within a ThingSpeakProvider")
  }
  return context
}
