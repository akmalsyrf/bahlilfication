import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bahlilfication - Transform Any Image',
  description: 'Upload an image and transform it with bahlilfication effect',
  keywords: ['image', 'transformation', 'bahlilfication', 'face', 'filter'],
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

