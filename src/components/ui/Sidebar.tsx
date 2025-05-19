'use client';

import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Ticket,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type Route =
  | 'dashboard'
  | 'events'
  | 'venues'
  | 'ticket-types'
  | 'bookings'
  | 'reports'
  | 'system-config';

interface NavItem {
  route: Route;
  label: string;
  icon: LucideIcon; // Type for Lucide icons
}

interface SidebarProps {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentRoute,
  setCurrentRoute,
  isOpen,
  onClose,
}: SidebarProps) {
  const navItems: NavItem[] = [
    { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: 'events', label: 'Events', icon: CalendarDays },
    { route: 'venues', label: 'Venues', icon: MapPin },
    { route: 'ticket-types', label: 'Ticket Types', icon: Ticket },
    { route: 'bookings', label: 'Bookings', icon: ShoppingCart },
    { route: 'reports', label: 'Reports', icon: BarChart3 },
    { route: 'system-config', label: 'System Config', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-800 bg-gray-900 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-pink-600">
            <span className="font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Fringe Admin
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map(({ route, label, icon: Icon }) => (
          <button
            key={route}
            onClick={() => setCurrentRoute(route)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              currentRoute === route
                ? 'bg-pink-600/20 font-medium text-pink-500'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
        <div className="mb-2 text-xs text-gray-500">
          Fringe Online Booking System
        </div>
        <div className="text-xs text-gray-500">v1.0.0</div>
      </div>
    </aside>
  );
}
