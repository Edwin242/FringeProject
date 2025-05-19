'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProfileMenu from '@/pages/public/ProfileMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import logo from '@/assets/logo.svg';

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

// Define the structure of the data returned from Supabase
interface VenueData {
  name: string;
}

interface EventData {
  id: string;
  name: string;
  description: string;
  schedule: string;
  image_url: string;
  venue_id: string;
  venues: VenueData | VenueData[] | null;
}

interface TicketType {
  id: string;
  event_id: string;
  category: string;
  price: number;
  capacity: number;
  description?: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState('1');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketSelectionOpen, setTicketSelectionOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [showTicketInfo, setShowTicketInfo] = useState<string | null>(null);

  const handleBookNow = () => {
    setTicketSelectionOpen(true);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select(
            `
            id,
            name,
            description,
            schedule,
            image_url,
            venue_id,
            venues ( name )
          `
          )
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
          return;
        }

        if (data) {
          const eventData = data as EventData;
          const dateObj = new Date(eventData.schedule);

          // Get venue name with proper type checking
          let venueName = 'TBA';

          if (eventData.venues) {
            if (Array.isArray(eventData.venues)) {
              // If venues is an array, take the first venue
              if (eventData.venues.length > 0) {
                venueName = eventData.venues[0].name || 'TBA';
              }
            } else {
              // If venues is a single object
              venueName = eventData.venues.name || 'TBA';
            }
          }

          setEvent({
            id: eventData.id,
            title: eventData.name,
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location: venueName,
            description: eventData.description,
            image: eventData.image_url || '/placeholder.svg',
            category: 'Featured',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTicketTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', id);

        if (error) {
          console.error('Error fetching ticket types:', error);
          return;
        }

        if (data) {
          setTicketTypes(data as TicketType[]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (id) {
      fetchEventDetails();
      fetchTicketTypes();
    }
  }, [id]);

  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const calculateTotal = () => {
    return ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + Number.parseFloat(ticket.price.toString()) * quantity;
    }, 0);
  };

  const handleProceedToPayment = () => {
    // Here you would typically save the selected tickets to state or context
    // before navigating to the payment page
    setTicketSelectionOpen(false);
    navigate('/payment', {
      state: {
        eventId: id,
        eventTitle: event?.title,
        selectedTickets: Object.entries(selectedTickets)
          .map(([id, quantity]) => {
            const ticket = ticketTypes.find((t) => t.id === id);
            return {
              id,
              category: ticket?.category,
              price: ticket?.price,
              quantity,
            };
          })
          .filter((t) => t.quantity > 0),
        totalAmount: calculateTotal(),
      },
    });
  };

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the actual booking process
    // For now, we'll just simulate a successful booking
    setBookingSuccess(true);
  };

  const toggleTicketInfo = (ticketId: string) => {
    if (showTicketInfo === ticketId) {
      setShowTicketInfo(null);
    } else {
      setShowTicketInfo(ticketId);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0f1a] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-pink-500"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0f1a] text-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Event Not Found</h2>
          <p className="mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate('/events')}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

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

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-16">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-white/70 hover:text-white"
          onClick={() => navigate('/events')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
              <img
                src={event.image || '/placeholder.svg'}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </AspectRatio>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" /> {event.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-500" /> {event.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-500" /> {event.location}
              </div>
            </div>

            <Badge className="text-transform: rounded-full bg-pink-600 px-3 py-1 text-xs text-white uppercase shadow">
              {event.category}
            </Badge>

            <Separator className="my-6 bg-white/10" />

            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-xl font-bold">About This Event</h2>
                <p className="text-white/80">{event.description}</p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-bold">Location</h2>
                <p className="text-white/80">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="h-fit md:sticky md:top-32">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-bold">Book Tickets</h2>

              <form onSubmit={handleBookTicket} className="space-y-4">
                <div className="pt-2">
                  <Button
                    onClick={handleBookNow}
                    className="mt-4 rounded-md bg-pink-600 text-white hover:bg-pink-700"
                  >
                    Book Now
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Dialog
          open={ticketSelectionOpen}
          onOpenChange={setTicketSelectionOpen}
        >
          <DialogContent className="w-full max-w-md bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Buy TIX</DialogTitle>
              <DialogDescription>{event.title}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="mb-2 grid grid-cols-3 gap-4 border-b border-white/10 pb-2 font-semibold">
                <div>Type</div>
                <div className="text-right">Price</div>
                <div className="text-right">Qty</div>
              </div>

              {ticketTypes.length === 0 ? (
                <div className="py-4 text-center text-white/70">
                  Loading ticket options...
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="space-y-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <div>
                          <div className="font-semibold">{ticket.category}</div>
                          {ticket.description && (
                            <div className="mt-1 text-sm text-white/70">
                              <button
                                onClick={() => toggleTicketInfo(ticket.id)}
                                className="text-pink-500 hover:text-pink-400"
                              >
                                + More Info
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          $
                          {Number.parseFloat(ticket.price.toString()).toFixed(
                            2
                          )}
                        </div>
                        <div className="text-right">
                          <Select
                            value={
                              selectedTickets[ticket.id]?.toString() || '0'
                            }
                            onValueChange={(value) =>
                              handleTicketQuantityChange(
                                ticket.id,
                                Number.parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="0" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {showTicketInfo === ticket.id && ticket.description && (
                        <div className="mt-1 rounded-md bg-white/5 p-3 text-sm text-white/80">
                          {ticket.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTicketSelectionOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-pink-600 hover:bg-pink-700 sm:w-auto"
                onClick={handleProceedToPayment}
                disabled={Object.values(selectedTickets).every(
                  (qty) => qty === 0 || !qty
                )}
              >
                Proceed to Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t border-white/10 bg-[#0d0f1a] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row">
          <div className="mb-4 flex items-center gap-2 md:mb-0">
            <img
              src={logo || '/placeholder.svg'}
              alt="Adelaide Fringe Logo"
              className="h-8"
            />
          </div>
          <div className="text-sm text-white/50">© 2024 COPYRIGHT BRON</div>
        </div>
      </footer>
    </div>
  );
}
