// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import ResponsiveLandingWrapper from '@/components/ResponsiveLandingWrapper';

export const metadata = {
  title: 'NexaApp',
  description: 'NexaApp — payments unified interface',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Replace favicon.io with your logo */}
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ResponsiveLandingWrapper>
          <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
          <footer className="text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} NexaApp
          </footer>
        </ResponsiveLandingWrapper>
      </body>
    </html>
  );
}
