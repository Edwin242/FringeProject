import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsSessionReady(true);
      } else {
        setError('Invalid or expired password reset link.');
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Password updated successfully!');
      navigate('/login');
    }

    setSubmitting(false);
  };

  if (!isSessionReady) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        {error ? <p>{error}</p> : <p>Loading reset session...</p>}
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f17] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-[#1a1a24] p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-pink-500">
          Reset Password
        </h1>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-[#252532] text-white"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-[#252532] text-white"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={handleSubmit}
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Reset Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
