import React from 'react';
import Link from 'next/link';
import { Button } from '../components/Button/Button';

export default function Index() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>NexusEd</h1>
      <p style={{ fontSize: '18px', color: 'var(--ink-muted)', marginBottom: '32px', maxWidth: '600px' }}>
        AI-Powered, Event-Driven E-Learning Platform.
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href="/login">
          <Button size="lg">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary" size="lg">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}
