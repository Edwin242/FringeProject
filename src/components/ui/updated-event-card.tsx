import { Link } from "react-router-dom"
import { Calendar, MapPin, Clock } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  image: string
  category: string
}

export const EventCard = ({ event }: { event: Event }) => {
  return (
    <Link to={`/event/${event.id}`} className="block transition-transform hover:scale-[1.02]">
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white/10 to-gray-800 p-0 shadow-md">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="h-full w-full rounded-t-2xl object-cover opacity-80"
            />
          </AspectRatio>

          <div className="absolute top-3 right-3">
            <Badge className="rounded-full bg-pink-600 px-3 py-1 text-xs text-white shadow">{event.category}</Badge>
          </div>

          <div className="absolute bottom-0 left-0 w-full rounded-b-2xl bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent p-4">
            <h3 className="mb-1 text-lg leading-tight font-bold text-white">{event.title}</h3>

            <p className="flex items-center gap-1 text-sm text-gray-300">
              <Calendar className="h-4 w-4" /> {event.date}
            </p>

            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {event.location}
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {event.time}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

