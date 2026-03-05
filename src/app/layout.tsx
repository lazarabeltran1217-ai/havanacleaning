import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/Providers";
import { JsonLd } from "@/components/website/JsonLd";
import { organizationSchema, websiteSchema, speakableSchema } from "@/lib/schema";
import { GoogleAnalytics } from "@/components/website/GoogleAnalytics";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://havanacleaning.com"),
  title: {
    default: "Havana Cleaning — Where Spotless Meets Soul",
    template: "%s | Havana Cleaning",
  },
  description:
    "Professional cleaning service for homes and businesses. Residential, deep clean, commercial, and specialty cleaning. Book online with instant pricing.",
  keywords: [
    "professional cleaning service",
    "house cleaning near me",
    "maid service",
    "deep cleaning service",
    "home cleaning",
    "cleaning company",
    "cleaning service florida",
    "miami cleaning service",
    "havana cleaning",
    "house cleaning miami",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Havana Cleaning",
    title: "Havana Cleaning — Professional Home & Business Cleaning",
    description: "Family-owned professional cleaning service. Residential, deep clean, commercial, and specialty cleaning. Book online today.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Havana Cleaning — Where Spotless Meets Soul" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Havana Cleaning — Professional Home & Business Cleaning",
    description: "Family-owned professional cleaning service. Book online with instant pricing.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: { "en-US": "/", "es-US": "/" },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2C1810" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Havana" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="Havana Cleaning" />
        <meta name="msapplication-TileColor" content="#2C1810" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={speakableSchema()} />
      </head>
      <body className="font-body antialiased bg-ivory text-tobacco">
        <GoogleAnalytics />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
