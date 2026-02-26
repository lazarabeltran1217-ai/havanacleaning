import Link from "next/link";
import type { Metadata } from "next";
import { PartyPopper } from "lucide-react";

export const metadata: Metadata = {
  title: "Application Submitted | Havana Cleaning",
};

export default function CareerSuccessPage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 flex items-start justify-center">
      <div className="max-w-md text-center">
        <PartyPopper className="w-16 h-16 text-green mx-auto mb-6" />
        <h1 className="font-display text-3xl mb-4">Application Submitted!</h1>
        <p className="text-[#7a6555] leading-relaxed mb-8">
          Thank you for applying to Havana Cleaning. We review applications
          within 48 hours. You&apos;ll receive an email with next steps.
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
