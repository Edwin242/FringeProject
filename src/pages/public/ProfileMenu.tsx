'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

export default function ProfileMenu() {
  const [lastName, setLastName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        setLastName(user.user_metadata?.last_name || null);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          <User className="h-5 w-5" />
          {isLoggedIn
            ? lastName
              ? capitalize(lastName)
              : 'Profile'
            : 'Profile'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 bg-[#1a1a24] text-white shadow-xl">
        {isLoggedIn ? (
          <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleSignIn}>Sign In</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
