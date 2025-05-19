'use client';

import type React from 'react';

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label-admin';
import { Textarea } from '@/components/ui/textarea';
import logo from '@/assets/logo.svg';
import ProfileMenu from '@/pages/public/ProfileMenu';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you soon.');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f17] text-white">
      {/* Header */}
      <header className="fixed z-50 w-full border-b border-white/10 bg-[#0d0f1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
          </div>

          {/* Center: Nav */}
          <div className="hidden flex-1 justify-center md:flex">
            <nav className="flex items-center gap-8 text-sm">
              <Link to="/home" className="font-medium text-pink-500">
                HOME
              </Link>
              <Link to="/events" className="text-white/70 hover:text-white">
                EVENTS
              </Link>
            </nav>
          </div>

          {/* Right: Contact + Profile */}
          <div className="flex items-center gap-4">
            <Link to="/contact">
              <Button className="bg-transparent text-sm text-white/70 hover:text-white">
                CONTACT US
              </Button>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>
      {/* Contact Form Content */}
      <div className="flex min-h-screen w-full items-center justify-center p-4 pt-24">
        <div className="grid w-full max-w-5xl gap-0 overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
          {/* Contact Form Section */}
          <div className="bg-[#1a1a24] p-8 md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-pink-500">
                  Contact Us
                </h1>
                <p className="text-gray-300">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Your message"
                    className="min-h-[120px] border-[#3a3a4a] bg-[#252532] text-white focus:border-pink-500 focus:ring-pink-500"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pink-500 text-white hover:bg-pink-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative hidden bg-pink-900 md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-800 to-pink-950 opacity-90"></div>
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <img
                  src="https://cwrsilqccmcevrgrycli.supabase.co/storage/v1/object/public/event-images//admin_banner.jpeg"
                  alt="Adelaide Fringe Contact"
                  width={400}
                  height={400}
                  className="mx-auto mb-8"
                />
                <h2 className="mb-4 text-2xl font-bold text-white">
                  Get in Touch
                </h2>
                <p className="text-pink-100">
                  Have questions about our events, tickets, or venues? We're
                  here to help make your Adelaide Fringe experience
                  unforgettable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
