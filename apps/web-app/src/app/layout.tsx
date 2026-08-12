import './global.css';

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
      <body>{children}</body>
    </html>
  );
}
