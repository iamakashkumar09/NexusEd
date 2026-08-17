import './global.css';
import { Suspense } from 'react';
import { PageProgressBar } from '@/components/PageProgressBar';

export const metadata = {
  title: 'NexusEd | AI-Powered E-Learning',
  description: 'Event-driven e-learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <PageProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
