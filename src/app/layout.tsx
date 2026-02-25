import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/Providers";
import { JsonLd } from "@/components/website/JsonLd";
import { localBusinessSchema, organizationSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Havana Cleaning — Where Spotless Meets Soul",
    template: "%s | Havana Cleaning",
  },
  description:
    "Miami's premier family-owned cleaning service. Residential, deep clean, commercial, and eco-friendly cleaning. Book online with instant pricing.",
  keywords: [
    "cleaning service miami",
    "house cleaning miami",
    "maid service miami",
    "deep cleaning miami",
    "eco friendly cleaning miami",
    "havana cleaning",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Havana Cleaning",
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
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
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
