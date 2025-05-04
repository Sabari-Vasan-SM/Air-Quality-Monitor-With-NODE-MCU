"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, AlertTriangle, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function SmsAlertService() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const { toast } = useToast()

  // Load settings from localStorage on component mount
  useState(() => {
    const savedPhone = localStorage.getItem("phoneNumber")
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }

    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setSmsEnabled(settings.smsAlerts || false)
    }
  })

  const handleSaveNumber = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("phoneNumber", phoneNumber)

    // Update notification settings
    const savedSettings = localStorage.getItem("notificationSettings")
    const settings = savedSettings ? JSON.parse(savedSettings) : { enableAlerts: true }
    settings.smsAlerts = smsEnabled
    localStorage.setItem("notificationSettings", JSON.stringify(settings))

    toast({
      title: "Settings Saved",
      description: "Your SMS alert settings have been saved",
    })
  }

  // Update the sendTestSMS function to use a different authentication approach
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
      const authToken = "1fd28f4b45d1891813fda52fffee1919" // Using the SID from the message as a token

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
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <span className="bg-emerald-500 text-white p-1 rounded-full">
            <MessageSquare className="h-4 w-4" />
          </span>
          SMS Alert Service
        </CardTitle>
        <CardDescription>Configure SMS alerts for critical air quality conditions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="sms-alerts" className="text-base">
                Enable SMS Alerts
              </Label>
              {smsEnabled ? (
                <Bell className="h-4 w-4 text-emerald-500" />
              ) : (
                <Bell className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Receive SMS notifications when air quality reaches critical levels
            </p>
          </div>
          <Switch
            id="sms-alerts"
            checked={smsEnabled}
            onCheckedChange={(checked) => setSmsEnabled(checked)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-number" className="text-base">
            Phone Number
          </Label>
          <p className="text-sm text-muted-foreground">
            Enter your phone number including country code (e.g., +1 for US)
          </p>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1 (123) 456-7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Important Information</h4>
              <p className="text-sm text-amber-700 mt-1">
                SMS alerts will be sent only when gas levels reach critical thresholds. To avoid excessive messages,
                alerts are limited to one every 15 minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={handleSaveNumber} className="bg-emerald-500 hover:bg-emerald-600">
            Save Settings
          </Button>
          <Button variant="outline" onClick={sendTestSMS} disabled={isSending || !phoneNumber}>
            {isSending ? "Sending..." : "Send Test SMS"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
