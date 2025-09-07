import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Navigation } from '@/components/ui/navigation';
import { AnimatedStarfield } from '@/components/effects/AnimatedStarfield';
import { GridOverlay } from '@/components/effects/GridOverlay';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'DeepSix - Navigate the Deepest Frontiers',
  description:
    'Navigate the Deepest Frontiers. Real-time NASA mission control dashboard tracking Mars rovers, Voyager probes, and deep space missions.',
  keywords:
    'NASA, space missions, Mars rover, Voyager, deep space, mission control, space exploration, DeepSix',
  authors: [{ name: 'DeepSix Team' }],
  openGraph: {
    title: 'DeepSix - Navigate the Deepest Frontiers',
    description: "Real-time tracking of humanity's journey into the deepest reaches of space",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-950 text-gray-100`}
      >
        <AnimatedStarfield />
        <GridOverlay />
        <FloatingParticles />
        <div className="relative z-10">
          <Navigation />
          <main className="min-h-screen">{children}</main>
        </div>
        <PerformanceMonitor enabled={true} position="bottom-right" minimal={false} />
        <Analytics />
      </body>
    </html>
  );
}
