import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/Providers";
import { JsonLd } from "@/components/website/JsonLd";
import { localBusinessSchema, organizationSchema, websiteSchema, speakableSchema } from "@/lib/schema";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://havanacleaning.com"),
  title: {
    default: "Havana Cleaning — Where Spotless Meets Soul",
    template: "%s | Havana Cleaning",
  },
  description:
    "Miami's premier family-owned cleaning service. Residential, deep clean, commercial, and specialty cleaning. Book online with instant pricing.",
  keywords: [
    "cleaning service miami",
    "house cleaning miami",
    "maid service miami",
    "deep cleaning miami",
    "professional cleaning miami",
    "havana cleaning",
    "cuban cleaning service miami",
    "house cleaning near me miami",
    "miami dade cleaning company",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Havana Cleaning",
    title: "Havana Cleaning — Miami's Premier Cleaning Service",
    description: "Family-owned cleaning service rooted in Cuban-American pride. Residential, deep clean, commercial, and specialty cleaning in Miami-Dade.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Havana Cleaning — Where Spotless Meets Soul" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Havana Cleaning — Miami's Premier Cleaning Service",
    description: "Family-owned cleaning service rooted in Cuban-American pride. Book online with instant pricing.",
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={speakableSchema()} />
      </head>
      <body className="font-body antialiased bg-ivory text-tobacco">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
