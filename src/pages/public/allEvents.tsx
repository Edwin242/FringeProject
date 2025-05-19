'use client';
import { useLocation } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  TicketIcon,
  ArrowLeft,
} from 'lucide-react';
import logo from '@/assets/logo.svg';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileMenu from '@/pages/public/ProfileMenu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
}

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 p-0 shadow-md">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AspectRatio>

        <div className="absolute top-3 right-3">
          <Badge className="rounded-full bg-pink-600 px-3 py-1 text-xs text-white capitalize shadow">
            {event.category}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 w-full rounded-b-2xl bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent p-4">
          <h3 className="mb-1 text-lg leading-tight font-bold text-white">
            {event.title}
          </h3>
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
  );
};

export default function AllEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category') || 'all';
    setSelectedCategory(categoryFromUrl);
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          id,
          name,
          description,
          schedule,
          image_url,
          category,
          venue_id,
          venues ( name )
        `
        )
        .order('schedule', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (data) {
        const formatted: Event[] = data.map((event: any) => {
          const dateObj = new Date(event.schedule);
          return {
            id: event.id,
            title: event.name,
            description: event.description,
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location: event.venues?.name || 'TBA',
            image: event.image_url || '/placeholder.svg',
            category: event.category?.toLowerCase().trim() || 'Featured',
          };
        });
        setEvents(formatted);
        console.log('Loaded Events:', formatted);
        console.log('Selected Category:', selectedCategory);
      }
    };

    fetchEvents();
  }, [selectedCategory]);
  console.log('Category filter applied:', selectedCategory);

  const categories = [
    'all',
    ...Array.from(new Set(events.map((event) => event.category))),
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory; // ✅ THIS LINE IS MISSING
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <div className="min-h-screen w-full bg-[#0d0f1a] text-white">
      <header className="fixed z-50 w-full border-b border-white/10 bg-[#0d0f1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
          </div>

          {/* Center: Nav */}
          <div className="hidden flex-1 justify-center md:flex">
            <nav className="flex items-center gap-8 text-sm">
              <Link to="/home" className="text-white/70 hover:text-white">
                HOME
              </Link>
              <Link to="/events" className="font-medium text-pink-500">
                EVENTS
              </Link>
            </nav>
          </div>

          {/* Right: Contact + Profile */}
          <div className="flex items-center gap-4">
            <Link to="/contact">
              <Button className="bg-transparent text-sm text-white/70 hover:text-white">
                CONTACT US
              </Button>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 pt-32">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              to="/"
              className="mb-2 inline-flex items-center text-pink-500 hover:text-pink-400"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-bold md:text-4xl">All Events</h1>
            <p className="mt-1 text-white/70">
              Browse and discover our upcoming art events
            </p>
          </div>
        </div>

        <section className="space-y-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent p-6">
          <h2 className="mb-4 text-xl font-bold">Find Events</h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-grow">
              <div className="bg-opacity-90 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md border-none bg-[#1f2130] pl-10 text-white focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <div className="bg-opacity-100 w-full md:w-64">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="rounded-md border-none bg-[#1f2130] text-white focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 bg-opacity-100 border-navy-700 text-white backdrop-blur">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section>
          <Tabs defaultValue="grid" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-white/70">
                {filteredEvents.length > 0 ? (
                  <>
                    Showing {filteredEvents.length} event
                    {filteredEvents.length > 1 ? 's' : ''} in{' '}
                    <span className="font-semibold text-white capitalize">
                      {selectedCategory}
                    </span>
                  </>
                ) : (
                  <>
                    No events found in{' '}
                    <span className="font-semibold text-white capitalize">
                      {selectedCategory}
                    </span>
                  </>
                )}
              </div>

              <TabsList className="bg-navy-900 border-navy-800 rounded-md border p-1">
                <TabsTrigger
                  value="grid"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white/60 transition-colors hover:text-white data-[state=active]:bg-pink-600 data-[state=active]:text-white"
                >
                  Grid
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white/60 transition-colors hover:text-white data-[state=active]:bg-pink-600 data-[state=active]:text-white"
                >
                  List
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentEvents.map((event) => (
                  <Link to={`/event/${event.id}`} key={event.id}>
                    <EventCard event={event} />
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {currentEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="to-navy-800/80 overflow-hidden border-0 bg-gradient-to-r from-white/10"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-48 w-full md:h-auto md:w-1/4">
                        <img
                          src={event.image || '/placeholder.svg'}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="rounded-full bg-pink-600 px-3 py-1 text-xs text-white shadow">
                            {event.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-white">
                            {event.title}
                          </h3>
                          <p className="mb-4 text-sm text-white/70">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {event.location}
                          </div>
                          <div className="flex-grow"></div>
                          <Link to={`/event/${event.id}`}>
                            <Button className="h-8 bg-pink-600 text-xs text-white hover:bg-pink-700">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {filteredEvents.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-4 rounded-lg border border-[#1a1b2e] bg-[#10111c] px-6 py-2">
              {/* Previous */}
              <span
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={`cursor-pointer text-sm font-semibold ${
                  currentPage === 1
                    ? 'cursor-default text-white/30'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Previous
              </span>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-md text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-pink-600 text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <span
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={`cursor-pointer text-sm font-semibold ${
                  currentPage === totalPages
                    ? 'cursor-default text-white/30'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Next
              </span>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0d0f1a] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row">
          <div className="mb-4 flex items-center gap-2 md:mb-0">
            <img src={logo} alt="Adelaide Fringe Logo" className="h-8" />
          </div>
          <div className="text-sm text-white/50">© 2024 COPYRIGHT BRON</div>
        </div>
      </footer>
    </div>
  );
}
