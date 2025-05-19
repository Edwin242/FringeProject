// src/components/dashboard/EventsContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import EventModal from './EventModal';
import Pagination from './Pagination'; // Assuming you have this component

interface Event {
  id: string;
  name: string;
  description: string;
  schedule: string;
  capacity: number;
  category: string;
  venue_id: string;
  venue: string;
  date: string;
  image_url?: string[];
}

interface Venue {
  id: string;
  name: string;
}

export default function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Total number of events
  const itemsPerPage = 10; // Number of events per page

  // Fetch events with pagination
  const fetchEvents = async (page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;

    // Fetch paginated events
    const { data, error } = await supabase
      .from('events')
      .select(
        'id, name, description, schedule, capacity, category, venue_id, image_url, venues(name)'
      )
      .order('schedule', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    // Fetch total count of events
    const { count, error: countError } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true }); // 'head: true' optimizes count query

    if (countError) {
      console.error('Error fetching event count:', countError);
      return;
    }

    const formattedEvents = data.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      schedule: event.schedule,
      capacity: event.capacity,
      category: event.category,
      venue_id: event.venue_id,
      venue: event.venues?.name || 'Unknown',
      date: format(new Date(event.schedule), 'yyyy-MM-dd'),
      image_url: event.image_url,
    }));

    setEvents(formattedEvents);
    setTotalItems(count || 0);
  };

  // Fetch venues
  const fetchVenues = async () => {
    const { data, error } = await supabase.from('venues').select('id, name');
    if (error) {
      console.error('Error fetching venues:', error);
      return;
    }
    setVenues((data as Venue[]) || []);
  };

  useEffect(() => {
    fetchEvents(currentPage);
    fetchVenues();
  }, [currentPage]); // Re-fetch when page changes

  const handleEventAdded = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev].slice(0, itemsPerPage)); // Add to current page, limit to itemsPerPage
    setTotalItems((prev) => prev + 1); // Increment total count
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const handleEventDeleted = async () => {
    await fetchEvents(currentPage); // Refresh current page after deletion
    setTotalItems((prev) => prev - 1); // Decrement total count
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white">Events</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full border-gray-800 bg-gray-900 pl-8 text-white sm:w-[250px]"
            />
          </div>
          <EventModal
            onEventAdded={handleEventAdded}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={handleEventDeleted}
            venues={venues}
          />
        </div>
      </div>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">All Events</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your events and performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 text-white">{event.name}</td>
                      <td className="px-4 py-3 text-gray-300">{event.venue}</td>
                      <td className="px-4 py-3 text-gray-300">{event.date}</td>
                      <td className="px-4 py-3 text-right">
                        <EventModal
                          onEventAdded={handleEventAdded}
                          onEventUpdated={handleEventUpdated}
                          onEventDeleted={handleEventDeleted}
                          eventToEdit={event}
                          venues={venues}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No events found for this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 border-t border-gray-800 pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
