// app/(marketing)/layout.tsx
import "../globals.css";
import Script from "next/script";
import { ReactNode } from "react";

export const metadata = {
  title: "Nexa - Payments, Utilities & Event Management",
  description:
    "Simplify payments, manage events, pay bills, buy airtime, track expenses and more with Nexa. Fast, secure, and all-in-one platform.",
  keywords:
    "Nexa, payments, bills, airtime, data, subscription, cable, electricity, DISCO, events, utilities, expense tracking, finance, dashboard, Nigerian fintech",
  alternates: {
    canonical: "https://nexa.com.ng/",
  },
  other: {
    "content-security": "Nexa legal pages available: privacy-policy, terms, financial-disclosure",
    },
  openGraph: {
    title: "Nexa - All-in-One Payments & Event Platform",
    description:
      "Instantly pay bills, manage events, buy airtime, track expenses, and more. Fast, secure, and user-friendly.",
    url: "https://nexa.com.ng/",
    images: [
      {
        url: "https://nexa.com.ng/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexa App - Payments & Events",
      },
    ],
    type: "website",
    siteName: "Nexa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa - Payments, Utilities & Event Platform",
    description:
      "All-in-one platform to pay bills, manage events, buy airtime, and track finances. Fast, secure, no signup required.",
    images: ["https://nexa.com.ng/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-XXXXXXX";

  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />

        {/* Facebook App ID */}
        <meta property="fb:app_id" content="914988614312614" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        {/* Meta Pixel (Facebook) */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq) return; n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments) };
              if(!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
              t=b.createElement(e); t.async=!0; t.src=v; s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '690154170852914');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=690154170852914&ev=PageView&noscript=1" />`,
          }}
        />

        {/* Main content */}
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white dark:bg-gray-900">
  <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

    <p className="text-sm text-gray-500">
      © {new Date().getFullYear()} Nexa. All rights reserved.
    </p>

    <div className="flex gap-6 text-sm text-gray-500">
      <a href="/privacy-policy" className="hover:text-black dark:hover:text-white transition">
        Privacy Policy
      </a>

      <a href="/terms" className="hover:text-black dark:hover:text-white transition">
        Terms
      </a>

      <a href="/financial-disclosure" className="hover:text-black dark:hover:text-white transition">
        Financial Disclosure
      </a>
    </div>

  </div>
</footer>
        </div>
      </body>
    </html>
  );
}
