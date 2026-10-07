import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Eswari Sound System | Concert Audio & Stage Rigging Production',
  description:
    'Tamil Nadu’s premier single-provider concert line-array sound, stage trussing, and intelligent DMX event lighting production. Zero sub-contracting, 100% direct crew & inventory.',
  keywords: [
    'Eswari Sound System',
    'Concert Audio Tamil Nadu',
    'Line Array Rental',
    'Stage Lighting Chennai Madurai',
    'Wedding Sound Production',
    'Event Sound Engineer',
  ],
  authors: [{ name: 'Eswari Sound System' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Eswari Sound System | Concert Audio & Stage Rigging',
    description:
      'Premier single-provider concert sound, line-array systems, and intelligent lighting. Instant date booking with 25% advance lock.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-ink text-neutral-100 min-h-screen flex flex-col font-body antialiased selection:bg-amber selection:text-ink">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 w-full pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
