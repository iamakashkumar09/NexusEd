'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegisterRequest } from '@nexus-ed/shared-types';
import { Input } from '../../../components/Input/Input';
import { Button } from '../../../components/Button/Button';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT', // Default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setRole = (role: 'STUDENT' | 'INSTRUCTOR') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful! We can redirect to login.
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-sans text-2xl font-semibold text-ink mb-2 tracking-tighter">Create an account</h1>
        <p className="font-sans text-sm text-ink-muted">Join NexusEd as a Student or Instructor</p>
      </div>
      
      {error && <div className="text-error mb-4 text-sm text-center">{error}</div>}

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input 
            label="First Name" 
            name="firstName"
            type="text" 
            placeholder="Jane"
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
          <Input 
            label="Last Name" 
            name="lastName"
            type="text" 
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
        </div>

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

        <div className="mb-4">
          <label className="font-sans text-sm font-medium text-ink block mb-2">
            I want to join as:
          </label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={formData.role === 'STUDENT' ? 'primary' : 'secondary'} 
              fullWidth
              onClick={() => setRole('STUDENT')}
            >
              Student
            </Button>
            <Button 
              type="button" 
              variant={formData.role === 'INSTRUCTOR' ? 'primary' : 'secondary'} 
              fullWidth
              onClick={() => setRole('INSTRUCTOR')}
            >
              Instructor
            </Button>
          </div>
        </div>
        
        <div className="h-6" />
        
        <Button type="submit" size="md" fullWidth disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:text-primary-hover transition-colors duration-200">
          Sign in
        </Link>
      </div>
    </div>
  );
}
