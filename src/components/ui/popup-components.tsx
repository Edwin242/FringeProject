'use client';

import { Button } from '@/components/ui/button';

interface PopupProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Popup({
  message,
  isOpen,
  onClose,
  title = 'Success',
}: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-[#1a1a24] p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-pink-500">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-[#252532]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-pink-500 text-white hover:bg-pink-600"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
