"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurrentReadings from "@/components/current-readings"
import PastData from "@/components/past-data"
import Location from "@/components/location"
import Navbar from "@/components/navbar"
import { ThingSpeakProvider } from "@/components/thingspeak-context"
import StatusEmoji from "@/components/status-emoji"
import NotificationSettings from "@/components/notification-settings"

export default function Home() {
  return (
    <ThingSpeakProvider apiKey="JDGWAWMXSSH9OJQW" channelId="2943472">
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <StatusEmoji className="mx-auto mb-2" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2 animate-fade-in">
              Air Quality Monitor 🌬️
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time monitoring of your environment's air quality parameters
            </p>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm border border-emerald-100">
              <TabsTrigger
                value="current"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Current Readings
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Past Data
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Location
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="animate-fade-in">
              <CurrentReadings />
            </TabsContent>
            <TabsContent value="past" className="animate-fade-in">
              <PastData />
            </TabsContent>
            <TabsContent value="location" className="animate-fade-in">
              <Location />
            </TabsContent>
            <TabsContent value="settings" className="animate-fade-in">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThingSpeakProvider>
  )
}
