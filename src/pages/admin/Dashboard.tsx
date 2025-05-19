// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react'; // Added useState import
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Route =
  | 'dashboard'
  | 'events'
  | 'venues'
  | 'ticket-types'
  | 'bookings'
  | 'reports'
  | 'system-config';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true); // Explicitly typed as boolean
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isMobile = !isDesktop;
  const location = useLocation();
  const navigate = useNavigate();

  // Derive the current route from the URL path
  const getCurrentRoute = (): Route => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path as Route;
  };

  const currentRoute = getCurrentRoute();

  const toggleSidebar = () => {
    setSidebarOpen((prev: boolean) => !prev); // Explicitly typed prev as boolean
  };

  const handleRouteChange = (route: Route) => {
    // Navigate to the new route
    const newPath =
      route === 'dashboard' ? '/admin/dashboard' : `/admin/dashboard/${route}`;
    navigate(newPath);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Ensure sidebar is open on desktop by default
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    }
  }, [isDesktop]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Sidebar
        currentRoute={currentRoute}
        setCurrentRoute={handleRouteChange}
        isOpen={isDesktop ? true : sidebarOpen}
        onClose={() => isMobile && setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={
            currentRoute.charAt(0).toUpperCase() +
            currentRoute.slice(1).replace('-', ' ')
          }
          toggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4">
          <Outlet /> {/* Render the nested route content */}
        </main>
      </div>
    </div>
  );
}
