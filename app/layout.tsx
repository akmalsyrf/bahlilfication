import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bahlilfication - Transform Any Image or Drawing into Bahlilfied',
  description: 'Upload an image or drawing and transform it into a bahlilfied image',
  keywords: ['image', 'transformation', 'bahlilfication', 'bahlil', 'bahilfied', 'face', 'filter', 'drawing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

