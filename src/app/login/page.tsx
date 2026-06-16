'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Flame, LogIn, Lock, Mail, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'manager' | 'staff') => {
    if (role === 'admin') {
      setEmail('admin@gpt.com');
      setPassword('admin123');
    } else if (role === 'manager') {
      setEmail('manager@gpt.com');
      setPassword('manager123');
    } else {
      setEmail('staff@gpt.com');
      setPassword('staff123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 select-none relative">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#2c4a21_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      <Link href="/" className="mb-8 flex flex-col items-center gap-1 group z-10">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-secondary font-black text-2xl shadow-lg shadow-primary/20">
          G
        </div>
        <h1 className="text-xl font-black text-primary tracking-tight font-display mt-2">
          Great Pickle Taste
        </h1>
        <span className="text-[10px] uppercase font-bold text-secondary tracking-widest block -mt-1">
          Internal Management Portal
        </span>
      </Link>

      <div className="w-full max-w-md z-10 animate-scaleIn">
        <Card className="border border-stone-200 shadow-xl bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-black text-primary font-display flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5 text-secondary" />
              Portal Log-In
            </CardTitle>
            <CardDescription>
              Enter credentials below to access the business administration dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. staff@gpt.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Security Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-bold text-sm bg-primary hover:bg-primary-dark mt-2"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Verifying access...' : 'Access Dashboard'}
              </Button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="border-t border-stone-200/60 pt-5 space-y-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 text-center">
                Quick Test Credentials (Mock Engine)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fillCredentials('admin')}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg p-2 text-center text-xs font-bold text-primary transition-all"
                >
                  Admin
                  <span className="block text-[9px] font-normal text-stone-400 mt-0.5">Raju</span>
                </button>
                <button
                  onClick={() => fillCredentials('manager')}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg p-2 text-center text-xs font-bold text-secondary transition-all"
                >
                  Manager
                  <span className="block text-[9px] font-normal text-stone-400 mt-0.5">Sita</span>
                </button>
                <button
                  onClick={() => fillCredentials('staff')}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg p-2 text-center text-xs font-bold text-stone-600 transition-all"
                >
                  Staff
                  <span className="block text-[9px] font-normal text-stone-400 mt-0.5">Milan</span>
                </button>
              </div>
              <p className="text-[9px] text-stone-400 text-center leading-normal">
                Credentials match the required Next.js auth specs. Fallback databases will load simulated transactions immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-semibold text-stone-500 hover:text-primary transition-colors">
            ← Back to Public Website Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
