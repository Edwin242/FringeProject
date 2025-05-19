'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator-admin';
import {
  Calendar,
  Clock,
  CreditCard,
  Edit,
  Mail,
  MapPin,
  Phone,
  Ticket,
  Trash2,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

export interface BookingDetails {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  event: string;
  venue?: string;
  date: string;
  tickets: number;
  ticketType?: string;
  total: number;
  paymentMethod?: string;
  status: string;
  createdAt?: string;
}

interface BookingDetailsModalProps {
  booking: BookingDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onEdit,
  onCancel,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'p');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/20 text-green-400 border-green-800/30';
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border-red-800/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-800 bg-gray-900 text-gray-100 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Booking Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Booking ID:{' '}
            <span className="font-mono text-gray-300">{booking.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Status Badge */}
        <div className="mt-2">
          <Badge className={`${getStatusColor(booking.status)} capitalize`}>
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-medium text-gray-400">
              <User className="mr-2 h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-3 rounded-lg bg-gray-800/50 p-4">
              <p className="font-medium text-white">{booking.customer}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {booking.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-300">{booking.email}</span>
                  </div>
                )}
                {booking.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-300">{booking.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-medium text-gray-400">
              <Calendar className="mr-2 h-4 w-4" />
              Event Information
            </h3>
            <div className="space-y-3 rounded-lg bg-gray-800/50 p-4">
              <p className="font-medium text-white">{booking.event}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-gray-300">
                      {formatDate(booking.date)}
                    </span>
                    <span className="mx-1 text-gray-500">at</span>
                    <span className="text-gray-300">
                      {formatTime(booking.date)}
                    </span>
                  </div>
                </div>
                {booking.venue && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-300">{booking.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-medium text-gray-400">
              <Ticket className="mr-2 h-4 w-4" />
              Ticket Information
            </h3>
            <div className="rounded-lg bg-gray-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-300">
                    {booking.tickets} ×
                  </span>
                  <span className="text-white">
                    {booking.ticketType || 'Standard Ticket'}
                  </span>
                </div>
                <span className="text-gray-300">
                  ${booking.total / booking.tickets} each
                </span>
              </div>

              <Separator className="my-3 bg-gray-700" />

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">${booking.total}</span>
              </div>

              {booking.paymentMethod && (
                <div className="mt-4 flex items-center text-sm">
                  <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">
                    Paid with {booking.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {booking.status !== 'cancelled' && (
              <Button
                variant="outline"
                className="border-red-800/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                onClick={() => onCancel(booking.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Booking
              </Button>
            )}

            {booking.status !== 'cancelled' && (
              <Button
                className="bg-pink-600 text-white hover:bg-pink-700"
                onClick={() => onEdit(booking.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Booking
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
