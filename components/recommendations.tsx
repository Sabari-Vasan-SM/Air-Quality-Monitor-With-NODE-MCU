"use client"

import { useState } from "react"
import { Check, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Recommendations({ airQualityStatus }) {
  const [completedTips, setCompletedTips] = useState([])

  const toggleTip = (tipId) => {
    if (completedTips.includes(tipId)) {
      setCompletedTips(completedTips.filter((id) => id !== tipId))
    } else {
      setCompletedTips([...completedTips, tipId])
    }
  }

  // Update the recommendations to match the gas sensors
  const generalTips = [
    {
      id: "plants",
      title: "Introduce Indoor Plants",
      description: "Spider plant, snake plant, or peace lily naturally filter air and absorb pollutants.",
    },
    {
      id: "cleaning",
      title: "Regular Cleaning",
      description: "Dust and vacuum frequently to remove particulate matter and allergens that can affect air quality.",
    },
    {
      id: "ventilation",
      title: "Improve Ventilation",
      description: "Open windows and doors to allow fresh air circulation and reduce indoor pollutant buildup.",
    },
    {
      id: "filters",
      title: "Use Air Purifiers",
      description: "HEPA air purifiers can remove up to 99.97% of airborne particles as small as 0.3 microns.",
    },
  ]

  const warningTips = [
    {
      id: "windows",
      title: "Keep Windows Open",
      description: "When gas levels are elevated, ensure proper ventilation to reduce concentration.",
    },
    {
      id: "appliances",
      title: "Check Gas Appliances",
      description: "Inspect gas appliances for leaks or malfunctions that could be releasing gases.",
    },
    {
      id: "activities",
      title: "Limit Indoor Cooking",
      description: "Reduce cooking activities that produce gases and ensure hood vents are working properly.",
    },
  ]

  const criticalTips = [
    {
      id: "evacuate",
      title: "Evacuate Immediately",
      description:
        "If gas levels are critically high, leave the area immediately and call emergency services from a safe location.",
    },
    {
      id: "shutoff",
      title: "Shut Off Gas Supply",
      description: "If safe to do so, turn off the main gas supply to prevent further leakage.",
    },
    {
      id: "medical",
      title: "Seek Medical Advice",
      description: "Consult a healthcare professional if you experience symptoms like headache, dizziness, or nausea.",
    },
  ]

  // Select tips based on air quality status
  let tips = generalTips
  if (airQualityStatus === "warning") {
    tips = [...warningTips, ...generalTips]
  } else if (airQualityStatus === "critical") {
    tips = [...criticalTips, ...warningTips, ...generalTips.slice(0, 2)]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
        <p className="text-sm">
          {airQualityStatus === "good"
            ? "Your air quality is good! Here are some tips to maintain it."
            : airQualityStatus === "warning"
              ? "Your air quality needs attention. Consider these recommendations to improve it."
              : "Your air quality is critical. Take immediate action with these recommendations."}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {tips.map((tip, index) => (
          <AccordionItem value={tip.id} key={tip.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 rounded-full ${
                    completedTips.includes(tip.id)
                      ? "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTip(tip.id)
                  }}
                >
                  {completedTips.includes(tip.id) && <Check className="h-3 w-3" />}
                </Button>
                <span className={completedTips.includes(tip.id) ? "line-through text-muted-foreground" : ""}>
                  {tip.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8">
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
