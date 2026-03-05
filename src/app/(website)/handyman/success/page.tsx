import Link from "next/link";
import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Quote Requested — Handyman Services",
};

export default function HandymanSuccessPage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 flex items-start justify-center">
      <div className="max-w-md text-center">
        <Wrench className="w-16 h-16 text-green mx-auto mb-6" />
        <h1 className="font-display text-3xl mb-4">Quote Request Received!</h1>
        <p className="text-[#7a6555] leading-relaxed mb-8">
          Thank you for your interest in our handyman services.
          Our team will review your request and get back to you within 24
          hours with a free quote.
        </p>
        <Link
          href="/handyman"
          className="inline-block bg-green text-white px-8 py-3 rounded-[3px] font-semibold hover:bg-green/90 transition-colors"
        >
          Back to Handyman Services
        </Link>
      </div>
    </section>
  );
}
