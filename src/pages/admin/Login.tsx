import type React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label-admin';
import { Checkbox } from '@/components/ui/checkbox';
import { LockIcon, MailIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data: authData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !authData?.user) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      setError('Access denied: Admins only.');
      setIsLoading(false);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-950 p-4 text-gray-100">
      <div className="grid w-full max-w-5xl gap-0 overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
        {/* Login Form Section */}
        <div className="bg-gray-900 p-8 md:p-10">
          <div className="mb-8 flex items-center gap-2">
            <img src={logo} alt="Admin Logo" className="h-6 w-auto" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
              <p className="text-gray-400">
                Enter your credentials to access the admin panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-700 bg-gray-800 pl-10 text-gray-100 focus:border-pink-600 focus:ring-pink-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-sm font-medium text-pink-500 hover:text-pink-400"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-700 bg-gray-800 pl-10 text-gray-100 focus:border-pink-600 focus:ring-pink-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  className="border-gray-700 data-[state=checked]:border-pink-600 data-[state=checked]:bg-pink-600"
                />
                <label
                  htmlFor="remember"
                  className="text-sm leading-none font-medium text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              {error && (
                <div className="rounded-md border border-red-800 bg-red-900/50 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-pink-600 py-2 font-medium text-white hover:bg-pink-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Need help?{' '}
              <a href="#" className="text-pink-500 hover:text-pink-400">
                Contact support
              </a>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative hidden bg-pink-900 md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-800 to-pink-950 opacity-90"></div>
          <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <img
                src="https://cwrsilqccmcevrgrycli.supabase.co/storage/v1/object/public/event-images//admin_banner.jpeg"
                alt="Admin Dashboard Illustration"
                width={400}
                height={400}
                className="mx-auto mb-8"
              />
              <h2 className="mb-4 text-2xl font-bold text-white">
                Secure Admin Access
              </h2>
              <p className="text-pink-100">
                Manage your content, users, and settings with our powerful admin
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
