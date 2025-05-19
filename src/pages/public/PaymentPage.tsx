import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = 'service_3e52d3v';
const EMAILJS_TEMPLATE_ID = 'template_h1bgg5e';  
const EMAILJS_PUBLIC_KEY  = 'QQE0rHIFYfsUbLYTq'; 

export default function PaymentPage() {
  const [cardName, setCardName]     = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv]               = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage]       = useState('');

  const { state } = useLocation();
  const {
    eventTitle      = 'Your Event',
    selectedTickets = [],
    totalAmount     = 0,
  } = state || {};

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    try {

      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) throw new Error('No logged-in email');

      const templateParams = {
        to_email:   email,
        eventTitle,
        total:      totalAmount.toFixed(2),
        tickets:    selectedTickets
                      .map(t => `${t.category} x${t.quantity}`)
                      .join(', '),
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setMessage('Payment successful! Receipt emailed to you.');
      setCardName(''); setCardNumber(''); setExpiryDate(''); setCvv('');
    } catch (err) {
      console.error('EmailJS error details:', err);
      alert(`EmailJS error → ${err?.text || err?.message || 'unknown'}`);
      setMessage('Payment processed, but email failed to send.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white">
      {}
      <header className="fixed z-50 w-full border-b border-white/10 bg-[#0d0f1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <img src={logo} alt="Adelaide Fringe" className="h-8" />
          <nav className="hidden items-center space-x-8 text-sm md:flex">
            <Link to="/home" className="font-medium text-pink-500">HOME</Link>
            <Link to="/events" className="text-white/70 hover:text-white">EVENTS</Link>
          </nav>
          <Link to="/contact">
            <Button className="bg-transparent text-sm text-white/70 hover:text-white">
              CONTACT&nbsp;US
            </Button>
          </Link>
        </div>
      </header>

      {/* form */}
      <main className="flex items-center justify-center px-4 pt-28 pb-10">
        <Card className="w-full max-w-md bg-gray-900">
          <CardContent className="p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">Payment Details</h2>

            {message && <p className="mb-6 text-center text-green-400">{message}</p>}

            <form onSubmit={handlePayment} className="space-y-5">
              {}
              <InputBlock id="cardName" label="Cardholder Name" value={cardName} onChange={setCardName} placeholder="John Doe" />
              <InputBlock id="cardNumber" label="Card Number"  value={cardNumber} onChange={setCardNumber} placeholder="1234 5678 9012 3456" />

              <div className="grid grid-cols-2 gap-4">
                <InputBlock id="expiryDate" label="Expiry Date" value={expiryDate} onChange={setExpiryDate} placeholder="MM/YY" />
                <InputBlock id="cvv"        label="CVV"        value={cvv}        onChange={setCvv}        placeholder="123" />
              </div>

              <div>
                <label htmlFor="amount" className="mb-1 block text-sm">Total</label>
                <Input id="amount" readOnly value={totalAmount.toFixed(2)} className="w-full cursor-not-allowed bg-[#1f2130]" />
              </div>

              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={processing}>
                {processing ? 'Processing…' : 'Pay Now'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function InputBlock({ id, label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm">{label}</label>
      <Input
        id={id}
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-600 bg-[#1f2130] p-3 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-600 focus:outline-none"
      />
    </div>
  );
}
