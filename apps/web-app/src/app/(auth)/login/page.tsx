'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoginRequest } from '@nexus-ed/shared-types';
import { Input } from '../../../components/Input/Input';
import { Button } from '../../../components/Button/Button';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Success! Cookies are set automatically by the backend.
      // Redirect to the dashboard (or homepage for now)
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-sans text-2xl font-semibold text-ink mb-2 tracking-tighter">Welcome back</h1>
        <p className="font-sans text-sm text-ink-muted">Sign in to your NexusEd account</p>
      </div>
      
      {error && <div className="text-error mb-4 text-sm text-center">{error}</div>}

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <Input 
          label="Email address" 
          name="email"
          type="email" 
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required 
        />
        <Input 
          label="Password" 
          name="password"
          type="password" 
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required 
        />
        
        <div className="h-6" />
        
        <Button type="submit" size="md" fullWidth disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-muted">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary font-medium hover:text-primary-hover transition-colors duration-200">
          Sign up
        </Link>
      </div>
    </div>
  );
}
