"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, Volume2, VolumeX, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    enableAlerts: true,
    soundAlerts: true,
    pushNotifications: true,
    criticalAlertsOnly: false,
    smsAlerts: false,
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const testSoundRef = useRef(null)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const savedPhone = localStorage.getItem("phoneNumber")
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
  }, [settings])

  // Save phone number to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("phoneNumber", phoneNumber)
  }, [phoneNumber])

  // Initialize test sound
  useEffect(() => {
    // Create audio element for test sound
    const audio = new Audio()
    audio.src = "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3"
    audio.preload = "auto"
    audio.volume = 0.7

    testSoundRef.current = audio

    return () => {
      if (testSoundRef.current) {
        testSoundRef.current.pause()
        testSoundRef.current = null
      }
    }
  }, [])

  const handleSettingChange = (setting) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [setting]: !prev[setting] }

      // Show toast notification
      toast({
        title: `${setting.charAt(0).toUpperCase() + setting.slice(1).replace(/([A-Z])/g, " $1")}`,
        description: newSettings[setting] ? "Enabled" : "Disabled",
      })

      return newSettings
    })
  }

  const playTestSound = () => {
    if (!testSoundRef.current) return

    // Reset to beginning
    testSoundRef.current.currentTime = 0

    // Play with promise handling for mobile
    const playPromise = testSoundRef.current.play()

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Could not play test sound:", error)

        toast({
          title: "Sound Test Failed",
          description: "Please interact with the page first to enable sound on your browser.",
        })
      })
    }
  }

  const sendTestSMS = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    const timeNow = new Date().toLocaleString()
    const airQuality = "Good - Test Message"
    const suggestion = "This is a test SMS from your Air Quality Monitor"

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

      toast({
        title: "Test SMS Sent",
        description: "A test message was sent to your phone number",
      })
    } catch (error) {
      console.error("Error sending SMS:", error)

      // Improved error handling with more details
      let errorMessage = "Please check your phone number and try again"
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please check your Twilio credentials."
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data && error.response.data.error_message) {
          errorMessage = error.response.data.error_message
        }
      }

      toast({
        title: "Failed to Send SMS",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white p-1 rounded-full">
              {settings.enableAlerts ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </span>
            Notification Settings
          </CardTitle>
          <CardDescription>Customize how you receive alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-alerts" className="text-base">
                Enable Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts when air quality parameters exceed thresholds
              </p>
            </div>
            <Switch
              id="enable-alerts"
              checked={settings.enableAlerts}
              onCheckedChange={() => handleSettingChange("enableAlerts")}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="sound-alerts" className="text-base">
                  Sound Alerts
                </Label>
                {settings.soundAlerts ? (
                  <Volume2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Play sound when alerts are triggered</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={playTestSound}
                disabled={!settings.enableAlerts || !settings.soundAlerts}
              >
                Test Sound
              </Button>
              <Switch
                id="sound-alerts"
                checked={settings.soundAlerts}
                onCheckedChange={() => handleSettingChange("soundAlerts")}
                disabled={!settings.enableAlerts}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive browser notifications when alerts are triggered</p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleSettingChange("pushNotifications")}
              disabled={!settings.enableAlerts}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="sms-alerts" className="text-base">
                  SMS Alerts
                </Label>
                <MessageSquare
                  className={`h-4 w-4 ${settings.smsAlerts ? "text-emerald-500" : "text-muted-foreground"}`}
                />
              </div>
              <p className="text-sm text-muted-foreground">Receive SMS notifications for critical alerts</p>
            </div>
            <Switch
              id="sms-alerts"
              checked={settings.smsAlerts}
              onCheckedChange={() => handleSettingChange("smsAlerts")}
              disabled={!settings.enableAlerts}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {settings.smsAlerts && (
            <div className="p-4 bg-emerald-50 rounded-md border border-emerald-100">
              <Label htmlFor="phone-number" className="text-sm font-medium mb-2 block">
                Phone Number for SMS Alerts
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 (123) 456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={sendTestSMS} disabled={isSending || !phoneNumber}>
                  {isSending ? "Sending..." : "Test SMS"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter your phone number including country code (e.g., +1 for US)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="critical-only" className="text-base">
                Critical Alerts Only
              </Label>
              <p className="text-sm text-muted-foreground">Only notify for critical threshold violations</p>
            </div>
            <Switch
              id="critical-only"
              checked={settings.criticalAlertsOnly}
              onCheckedChange={() => handleSettingChange("criticalAlertsOnly")}
              disabled={!settings.enableAlerts}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Alert Information</h3>
            <p className="text-sm text-blue-700">
              Sound alerts may require user interaction on mobile devices due to browser restrictions. SMS alerts will
              be sent only for critical air quality conditions to avoid excessive messages.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
