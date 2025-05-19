// BookingsContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Filter } from 'lucide-react';
import FilterModal, { type BookingFilters } from './FilterModal';
import SortMenu, { type SortOption } from './SortMenu';
import Pagination from './Pagination';
import BookingDetailsModal, {
  type BookingDetails,
} from './BookingDetailsModal';
import EditBookingDialog from './EditBookingDialog';

export default function BookingsContent() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<BookingFilters>({});
  const [currentSort, setCurrentSort] = useState<SortOption>({
    field: 'date',
    direction: 'desc',
    label: 'Date (Newest first)',
  });
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<{
    id: string | null;
    tickets: number;
    ticket_type_id?: string;
    total: number;
  }>({ id: null, tickets: 0, total: 0 });

  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `id, status, total_price, quantity, booking_date, customer_id, ticket_type_id, events(name)`
        )
        .order('booking_date', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      const customerIds = Array.from(
        new Set(data.map((b: any) => b.customer_id))
      );
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', customerIds);

      const profileMap: Record<
        string,
        { first_name: string; last_name: string }
      > = {};
      if (profiles) {
        profiles.forEach((p) => {
          profileMap[p.id] = {
            first_name: p.first_name,
            last_name: p.last_name,
          };
        });
      }

      const merged = data.map((b: any) => ({
        id: b.id,
        status: b.status,
        total: b.total_price,
        tickets: b.quantity,
        date: b.booking_date,
        event: b.events?.name || 'N/A',
        customer: profileMap[b.customer_id]
          ? `${profileMap[b.customer_id].first_name} ${profileMap[b.customer_id].last_name}`
          : 'N/A',
        ticket_type_id: b.ticket_type_id,
      }));

      setBookings(merged);
    };

    fetchBookings();
  }, []);

  const handleViewBooking = (booking: BookingDetails) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setBookingToEdit({
        id: bookingId,
        tickets: booking.tickets,
        ticket_type_id: booking.ticket_type_id,
        total: booking.total,
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async (bookingId: string, newQuantity: number) => {
    try {
      console.log(
        'Starting edit process for booking:',
        bookingId,
        'New quantity:',
        newQuantity
      );

      // 1. Get the ticket type price
      const { data: ticketType, error: ticketError } = await supabase
        .from('ticket_types')
        .select('price, capacity')
        .eq('id', bookingToEdit.ticket_type_id)
        .single();

      if (ticketError || !ticketType) {
        console.error(
          'Failed to fetch ticket type:',
          ticketError?.message || 'No ticket type found'
        );
        return;
      }

      console.log('Ticket type found:', ticketType);

      // Check capacity
      if (newQuantity > ticketType.capacity) {
        console.error(
          `New quantity (${newQuantity}) exceeds ticket type capacity (${ticketType.capacity})`
        );
        alert('Quantity exceeds available capacity');
        return;
      }

      const newTotalPrice = Number(ticketType.price) * newQuantity;

      // 2. Update the booking
      const { data: updatedBooking, error: bookingError } = await supabase
        .from('bookings')
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (bookingError || !updatedBooking) {
        console.error(
          'Failed to update booking:',
          bookingError?.message || 'No data returned'
        );
        alert('Failed to update booking. Please try again.');
        return;
      }

      console.log('Booking updated successfully:', updatedBooking);

      // 3. Check for and update related transaction if it exists
      const { data: transactions, error: transactionCheckError } =
        await supabase
          .from('transactions')
          .select('id')
          .eq('booking_id', bookingId);

      if (transactionCheckError) {
        console.error(
          'Error checking transactions:',
          transactionCheckError.message
        );
        return;
      }

      if (transactions && transactions.length > 0) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({
            amount: newTotalPrice,
          })
          .eq('booking_id', bookingId);

        if (transactionError) {
          console.error(
            'Failed to update transaction:',
            transactionError.message
          );
          alert('Booking updated but transaction update failed');
          return;
        }
        console.log('Transaction updated successfully');
      } else {
        console.log('No transactions found for this booking');
      }

      // 4. Update local state only after successful backend update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, tickets: newQuantity, total: newTotalPrice }
            : b
        )
      );
      console.log('Local state updated');
    } catch (error) {
      console.error('Unexpected error in handleSaveEdit:', error);
      alert(
        'An unexpected error occurred. Please check the console for details.'
      );
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookingToEdit({ id: bookingId, tickets: 0, total: 0 });
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingToEdit.id!);

    if (error) {
      console.error(error);
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingToEdit.id ? { ...b, status: 'cancelled' } : b
      )
    );

    setCancelDialogOpen(false);
    setIsDetailsModalOpen(false);
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    if (activeTab !== 'all') {
      filtered = filtered.filter((b) => b.status === activeTab);
    }

    if (activeFilters.customer) {
      filtered = filtered.filter((b) =>
        b.customer.toLowerCase().includes(activeFilters.customer!.toLowerCase())
      );
    }
    if (activeFilters.event) {
      filtered = filtered.filter((b) =>
        b.event.toLowerCase().includes(activeFilters.event!.toLowerCase())
      );
    }
    if (activeFilters.status) {
      filtered = filtered.filter((b) => b.status === activeFilters.status);
    }
    if (activeFilters.dateFrom) {
      filtered = filtered.filter(
        (b) => new Date(b.date) >= new Date(activeFilters.dateFrom!)
      );
    }
    if (activeFilters.dateTo) {
      filtered = filtered.filter(
        (b) => new Date(b.date) <= new Date(activeFilters.dateTo!)
      );
    }
    if (activeFilters.minTotal) {
      filtered = filtered.filter((b) => b.total >= activeFilters.minTotal!);
    }
    if (activeFilters.maxTotal) {
      filtered = filtered.filter((b) => b.total <= activeFilters.maxTotal!);
    }

    filtered.sort((a, b) => {
      if (currentSort.field === 'date') {
        return currentSort.direction === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (currentSort.field === 'customer') {
        return currentSort.direction === 'asc'
          ? a.customer.localeCompare(b.customer)
          : b.customer.localeCompare(a.customer);
      }
      if (currentSort.field === 'total') {
        return currentSort.direction === 'asc'
          ? a.total - b.total
          : b.total - a.total;
      }
      return 0;
    });

    return filtered;
  };

  const handleApplyFilters = (filters: BookingFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const filteredBookings = filterBookings();
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  };

  const currentBookings = getCurrentPageItems();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) return;

    const headers = [
      'Booking ID',
      'Customer',
      'Event',
      'Date',
      'Tickets',
      'Total',
      'Status',
    ];

    const rows = filteredBookings.map((b) => [
      b.id,
      b.customer,
      b.event,
      formatDate(b.date),
      b.tickets,
      b.total,
      b.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white">Bookings</h2>
        <div className="flex items-center gap-2">
          <SortMenu currentSort={currentSort} onSortChange={setCurrentSort} />
          <Button
            variant="outline"
            className={`border-gray-700 hover:bg-gray-800 ${
              Object.keys(activeFilters).length > 0
                ? 'border-pink-500/50 text-pink-500'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter
              className={`mr-2 h-4 w-4 ${
                Object.keys(activeFilters).length > 0 ? 'text-pink-500' : ''
              }`}
            />
            {Object.keys(activeFilters).length > 0
              ? 'Filters Applied'
              : 'Filter'}
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={exportToCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="space-y-4"
      >
        <TabsList className="border-gray-800 bg-gray-900">
          {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white capitalize">
                {activeTab === 'all' ? 'All' : activeTab} Bookings
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and manage {activeTab === 'all' ? 'all' : activeTab}{' '}
                bookings
                {Object.keys(activeFilters).length > 0 && ' (filtered)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Booking ID
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Tickets
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBookings.map((b) => (
                          <tr
                            key={b.id}
                            className="border-b border-gray-800 hover:bg-gray-800/50"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-white">
                              {b.id}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {b.customer}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {b.event}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {formatDate(b.date)}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {b.tickets}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              ${b.total}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  b.status === 'confirmed'
                                    ? 'bg-green-900/20 text-green-400'
                                    : b.status === 'pending'
                                      ? 'bg-yellow-900/20 text-yellow-400'
                                      : 'bg-red-900/20 text-red-400'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white"
                                onClick={() => handleViewBooking(b)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
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
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No bookings found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditBooking}
        onCancel={handleCancelBooking}
      />

      <ConfirmDialog
        open={isCancelDialogOpen}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking?"
        onConfirm={confirmCancelBooking}
        onCancel={() => setCancelDialogOpen(false)}
      />

      <EditBookingDialog
        bookingId={bookingToEdit.id}
        currentQuantity={bookingToEdit.tickets}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setIsDetailsModalOpen(false);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
