'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label-admin';
import { supabase } from '@/lib/supabaseClient';

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const checkPasswordStrength = (password: string) => {
  if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
    return 'Strong';
  } else if (password.length >= 6) {
    return 'Medium';
  }
  return 'Weak';
};

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      setIsSubmitting(false);
      return;
    }

    if (isSignUp && passwordStrength === 'Weak') {
      setError('Password too weak. Try using uppercase and numbers.');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;

      if (isSignUp) {
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });

        if (result.error) {
          throw result.error;
        }

        setPopupMessage('Account created successfully! ');
        setShowPopup(true);

        // Reset form and switch to Sign In mode
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        });
        setPasswordStrength('');
        setIsSignUp(false);

        // Optional small delay before redirect
        setTimeout(() => {
          setShowPopup(false);
          navigate('/login');
        }, 2000); // 2s delay to let popup show
        return;
      } else {
        // 1. Sign in with Supabase
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (result.error) throw result.error;

        // 2. Fetch the signed-in user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw userError || new Error('User not found');
        }

        // 3. Get first and last name from Supabase metadata

        // 5. All good
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(formData.email)) {
      setError('Enter a valid email to reset password.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: 'https://adelaide-fringe.netlify.app/reset-password',
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setPopupMessage('Password reset email sent. Check your inbox.');
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f17] text-white">
      <div className="flex min-h-screen w-full items-center justify-center p-4 pt-24">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
          <div className="bg-[#1a1a24] p-8 md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-pink-500">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-300">
                  {isSignUp
                    ? 'Sign up to start your journey'
                    : 'Sign in to your account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First & Last Name - always visible */}
                {/* First & Last Name - only show for Sign Up */}
                {isSignUp && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {formData.password && isSignUp && (
                    <p
                      className={`text-sm ${
                        passwordStrength === 'Strong'
                          ? 'text-green-500'
                          : passwordStrength === 'Medium'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      Password Strength: {passwordStrength}
                    </p>
                  )}
                </div>

                {/* Forgot Password (Sign In only) */}
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-pink-500 hover:underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && <p className="text-sm text-red-500">{error}</p>}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-pink-500 text-white hover:bg-pink-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isSignUp
                      ? 'Creating Account...'
                      : 'Signing In...'
                    : isSignUp
                      ? 'Sign Up'
                      : 'Sign In'}
                </Button>

                {/* Toggle mode */}
                <div className="text-center text-sm text-white/60">
                  {isSignUp
                    ? 'Already have an account?'
                    : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        password: '',
                      });
                      setPasswordStrength('');
                      setError('');
                    }}
                    className="text-pink-500 hover:underline"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="relative hidden bg-pink-900 md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-800 to-pink-950 opacity-90"></div>
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <img
                  src="https://cwrsilqccmcevrgrycli.supabase.co/storage/v1/object/public/event-images//admin_banner.jpeg"
                  alt="Login Visual"
                  className="mx-auto mb-8"
                />
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {isSignUp
                    ? 'Join the Art Movement'
                    : 'Welcome to Adelaide Fringe'}
                </h2>
                <p className="text-pink-100">
                  {isSignUp
                    ? 'Create your free account and start exploring unforgettable events.'
                    : 'Sign in to access your favorite events and more.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-[#1a1a24] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-pink-500">Success</h3>
              <button
                onClick={() => setShowPopup(false)}
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
              <p className="text-gray-300">{popupMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowPopup(false)}
                className="bg-pink-500 text-white hover:bg-pink-600"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
