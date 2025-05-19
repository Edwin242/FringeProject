import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-800 bg-[#0f0f17] px-6 py-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Adelaide Fringe" className="h-10 w-auto" />
        </Link>

        <nav className="flex items-center gap-8">
          <Link to="/" className="text-pink-500 transition hover:text-pink-400">
            HOME
          </Link>
          <Link
            to="/events"
            className="text-white transition hover:text-pink-400"
          >
            EVENTS
          </Link>
          <Button asChild className="bg-pink-500 text-white hover:bg-pink-600">
            <Link to="/contact">CONTACT US</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
