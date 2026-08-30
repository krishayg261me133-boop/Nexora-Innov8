import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/AuthLayout';
import { toast } from '@/lib/toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success('Reset link sent to your email');
  }

  return (
    <AuthLayout title="Reset password" subtitle="We'll send you a link to reset your password">
      {sent ? (
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-tealx-50 text-tealx-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-6 text-slatey-700">
            Check your inbox at <span className="font-semibold">{email}</span> for a password reset link.
          </p>
          <Link to="/login" className="btn-secondary mt-8">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slatey-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slatey-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  className="input-field pl-11"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? 'Sending...' : 'Send Reset Link'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
          <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slatey-600 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
