import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus } from "lucide-react"

export default function VenuesContent() {
  const venues = [
    {
      id: 1,
      name: "Main Theatre",
      capacity: 500,
      location: "City Center",
      facilities: ["Stage", "Lighting", "Sound System"],
    },
    { id: 2, name: "Garden Stage", capacity: 300, location: "Park Area", facilities: ["Open Air", "Basic Lighting"] },
    {
      id: 3,
      name: "Drama Hall",
      capacity: 200,
      location: "Arts District",
      facilities: ["Stage", "Lighting", "Sound System"],
    },
    { id: 4, name: "Small Hall", capacity: 100, location: "Downtown", facilities: ["Basic Stage", "Basic Sound"] },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Venues</h2>
        <Button className="bg-pink-600 hover:bg-pink-700 text-white sm:w-auto w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Venue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {venues.map((venue) => (
          <Card key={venue.id} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{venue.name}</CardTitle>
                  <CardDescription className="text-gray-400 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {venue.location}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Capacity</p>
                  <p className="text-white font-medium">{venue.capacity} seats</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Facilities</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {venue.facilities.map((facility, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-800 text-gray-300"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

