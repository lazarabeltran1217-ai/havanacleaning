import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Quote Requested",
};

export default function CommercialSuccessPage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 flex items-start justify-center">
      <div className="max-w-md text-center">
        <ClipboardCheck className="w-16 h-16 text-green mx-auto mb-6" />
        <h1 className="font-display text-3xl mb-4">Quote Request Received!</h1>
        <p className="text-[#7a6555] leading-relaxed mb-8">
          Thank you for your interest in our commercial cleaning services.
          Our team will review your request and get back to you within 24
          hours with a custom quote.
        </p>
        <Link
          href="/"
          className="inline-block bg-green text-white px-8 py-3 rounded-[3px] font-semibold hover:bg-green/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
