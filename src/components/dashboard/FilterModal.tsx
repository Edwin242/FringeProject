'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label-admin';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: BookingFilters) => void;
}

export interface BookingFilters {
  event?: string;
  customer?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  minTotal?: number;
  maxTotal?: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApplyFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [eventOptions, setEventOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
      } else if (data) {
        setEventOptions(data.map((e) => e.name));
      }
    };

    fetchEvents();
  }, []);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: BookingFilters = {};
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters); // Apply cleared filters immediately
    onClose(); // Close the modal
  };

  const handleChange = (key: keyof BookingFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-gray-800 bg-gray-900 text-gray-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">Filter Bookings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Apply filters to narrow down your booking results.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event" className="text-gray-300">
                Event
              </Label>
              <Select
                value={filters.event}
                onValueChange={(value) => handleChange('event', value)}
              >
                <SelectTrigger
                  id="event"
                  className="border-gray-700 bg-gray-800 text-gray-100"
                >
                  <SelectValue placeholder="Any event" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                  {eventOptions.map((eventName) => (
                    <SelectItem key={eventName} value={eventName}>
                      {eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger
                  id="status"
                  className="border-gray-700 bg-gray-800 text-gray-100"
                >
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* The rest of the fields (customer, dates, totals) remain the same */}

          <div className="space-y-2">
            <Label htmlFor="customer" className="text-gray-300">
              Customer
            </Label>
            <Input
              id="customer"
              placeholder="Search by customer name"
              className="border-gray-700 bg-gray-800 text-gray-100"
              value={filters.customer || ''}
              onChange={(e) => handleChange('customer', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start border-gray-700 bg-gray-800 text-left font-normal text-gray-100 ${!filters.dateFrom && 'text-gray-500'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(filters.dateFrom, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-gray-700 bg-gray-800 p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleChange('dateFrom', date)}
                    initialFocus
                    className="bg-gray-800 text-gray-100"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start border-gray-700 bg-gray-800 text-left font-normal text-gray-100 ${!filters.dateTo && 'text-gray-500'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(filters.dateTo, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-gray-700 bg-gray-800 p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleChange('dateTo', date)}
                    initialFocus
                    className="bg-gray-800 text-gray-100"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTotal" className="text-gray-300">
                Min Total ($)
              </Label>
              <Input
                id="minTotal"
                type="number"
                placeholder="0"
                className="border-gray-700 bg-gray-800 text-gray-100"
                value={filters.minTotal || ''}
                onChange={(e) =>
                  handleChange(
                    'minTotal',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTotal" className="text-gray-300">
                Max Total ($)
              </Label>
              <Input
                id="maxTotal"
                type="number"
                placeholder="No limit"
                className="border-gray-700 bg-gray-800 text-gray-100"
                value={filters.maxTotal || ''}
                onChange={(e) =>
                  handleChange(
                    'maxTotal',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="mt-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white sm:mt-0"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-pink-600 text-white hover:bg-pink-700"
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
