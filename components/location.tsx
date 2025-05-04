"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, MapPin, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function Location() {
  const [location, setLocation] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(location)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch location data based on IP address
  useEffect(() => {
    async function fetchLocationByIP() {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("https://ipapi.co/json/")
        if (!response.ok) {
          throw new Error("Failed to fetch location data")
        }

        const data = await response.json()

        const newLocation = {
          name: data.city || "Unknown Location",
          address: `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""} ${data.postal || ""}`,
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
        }

        setLocation(newLocation)
        setFormData(newLocation)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching location:", err)
        setError("Failed to detect location automatically. You can enter it manually.")
        setIsLoading(false)

        // Set fallback location if detection fails
        const fallbackLocation = {
          name: "Kongu Engineering College",
          address: "Perundurai, Erode, Tamil Nadu 638060, India",
          latitude: "11.275250",
          longitude: "77.605641",
        }
        setLocation(fallbackLocation)
        setFormData(fallbackLocation)
      }
    }

    fetchLocationByIP()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setLocation(formData)
    setIsEditing(false)
    toast({
      title: "Location updated",
      description: "Your device location has been updated successfully.",
    })
  }

  const refreshLocation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://ipapi.co/json/")
      if (!response.ok) {
        throw new Error("Failed to fetch location data")
      }

      const data = await response.json()

      const newLocation = {
        name: data.city || "Unknown Location",
        address: `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""} ${data.postal || ""}`,
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
      }

      setLocation(newLocation)
      setFormData(newLocation)
      setIsLoading(false)

      toast({
        title: "Location refreshed",
        description: "Your location has been updated based on your current IP address.",
      })
    } catch (err) {
      setError("Failed to refresh location. Please try again.")
      setIsLoading(false)

      toast({
        title: "Location refresh failed",
        description: "Could not detect your current location. Please try again or enter manually.",
        variant: "destructive",
      })
    }
  }

  // Create Google Maps embed URL from coordinates
  const getMapUrl = () => {
    if (!location.latitude || !location.longitude) {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d464.9039764936954!2d77.60634161456144!3d11.273488166973788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96d78104f1ffd%3A0xba4aecb3f9a06063!2sIT%20PARK%40KEC!5e1!3m2!1sen!2sin!4v1746188778951!5m2!1sen!2sin"
    }

    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!${location.longitude}!${location.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM4sCMTEnJDI3LjUiTiA3N8KwMzYnMjAuMyJF!5e1!3m2!1sen!2sin!4v1746188778951!5m2!1sen!2sin`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Device Location</h2>
          <p className="text-muted-foreground">Your air quality monitor's current location</p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={refreshLocation} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Location
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Location Details
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Detecting your location..."
              : error
                ? error
                : "Automatically detected based on your IP address"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Location Name</h3>
                  <p>{location.name}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Address</h3>
                  <p>{location.address}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Coordinates</h3>
                  <p>
                    {location.latitude}, {location.longitude}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Map View</CardTitle>
          <CardDescription>Visual representation of your device location</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="aspect-video rounded-md" />
          ) : (
            <div className="aspect-video rounded-md overflow-hidden">
              <iframe
                src={getMapUrl()}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Device Location Map"
                className="rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Context</CardTitle>
          <CardDescription>Local environmental factors that may affect air quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Climate Zone</h3>
                <p>{location.latitude < 23.5 && location.latitude > 0 ? "Tropical" : "Temperate"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Elevation</h3>
                <p>Approximately 180-200 meters above sea level</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Nearby Pollution Sources</h3>
                <p>Urban area, moderate traffic, industrial activities</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Green Space Proximity</h3>
                <p>Varies by location - check local parks and reserves</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
