import Script from "next/script";
import { prisma } from "@/lib/prisma";

async function getGaId(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "google_analytics_id" },
    });
    const dbVal = typeof setting?.value === "string" ? setting.value : "";
    if (dbVal) return dbVal;
  } catch {
    // DB unavailable
  }
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-N2FYK6WHCT"
  );
}

export async function GoogleAnalytics() {
  const gaId = await getGaId();
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
