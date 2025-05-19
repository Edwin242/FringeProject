// EditBookingDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label-admin';

interface EditBookingDialogProps {
  bookingId: string | null;
  currentQuantity: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, newQuantity: number) => Promise<void>;
}

export default function EditBookingDialog({
  bookingId,
  currentQuantity,
  isOpen,
  onClose,
  onSave,
}: EditBookingDialogProps) {
  const [quantity, setQuantity] = useState(currentQuantity);

  const handleSave = async () => {
    if (bookingId && quantity > 0) {
      await onSave(bookingId, quantity);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-gray-800 bg-gray-900 text-gray-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Booking</DialogTitle>
          <DialogDescription className="text-gray-400">
            Modify the ticket quantity for booking ID:{' '}
            <span className="font-mono">{bookingId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right text-gray-300">
              Tickets
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="col-span-3 border-gray-700 bg-gray-800 text-white focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-pink-600 text-white hover:bg-pink-700"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
