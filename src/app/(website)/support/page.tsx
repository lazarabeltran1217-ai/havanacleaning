import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Clock, HelpCircle, CreditCard, Calendar, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get help with Havana Cleaning — FAQs, contact information, and support for bookings, payments, and account issues.",
};

const supportTopics = [
  {
    icon: Calendar,
    title: "Booking Help",
    desc: "Questions about scheduling, rescheduling, or cancelling a cleaning.",
    href: "/faq",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    desc: "Payment methods, receipts, refunds, and billing inquiries.",
    href: "/faq",
  },
  {
    icon: User,
    title: "Account Issues",
    desc: "Login problems, password reset, and account management.",
    href: "/forgot-password",
  },
  {
    icon: HelpCircle,
    title: "General Questions",
    desc: "Service areas, cleaning types, and how Havana Cleaning works.",
    href: "/faq",
  },
];

export default function SupportPage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl mb-2">Help & Support</h1>
        <p className="text-sand text-sm mb-10">
          We&apos;re here to help. Find answers or reach out to our team.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-tobacco/8 rounded-xl p-5 text-center">
            <Phone className="w-5 h-5 text-green mx-auto mb-2" />
            <p className="font-semibold text-sm text-tobacco">Call Us</p>
            <a href="tel:+13055550100" className="text-green text-sm hover:underline">
              (305) 555-0100
            </a>
          </div>
          <div className="bg-white border border-tobacco/8 rounded-xl p-5 text-center">
            <Mail className="w-5 h-5 text-green mx-auto mb-2" />
            <p className="font-semibold text-sm text-tobacco">Email Us</p>
            <a href="mailto:support@havanacleaning.com" className="text-green text-sm hover:underline">
              support@havanacleaning.com
            </a>
          </div>
          <div className="bg-white border border-tobacco/8 rounded-xl p-5 text-center">
            <Clock className="w-5 h-5 text-green mx-auto mb-2" />
            <p className="font-semibold text-sm text-tobacco">Business Hours</p>
            <p className="text-tobacco/60 text-sm">Mon–Sat, 8AM–6PM</p>
          </div>
        </div>

        {/* Support Topics */}
        <h2 className="font-display text-xl mb-4">How can we help?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {supportTopics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="bg-white border border-tobacco/8 rounded-xl p-5 hover:border-green/30 transition-colors group"
            >
              <topic.icon className="w-5 h-5 text-green mb-3 group-hover:text-green/80 transition-colors" />
              <h3 className="font-semibold text-sm text-tobacco mb-1">{topic.title}</h3>
              <p className="text-tobacco/60 text-xs leading-relaxed">{topic.desc}</p>
            </Link>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="bg-tobacco/5 rounded-xl p-6 text-center">
          <h2 className="font-display text-lg mb-2">Still have questions?</h2>
          <p className="text-tobacco/60 text-sm mb-4">
            Check out our frequently asked questions for quick answers.
          </p>
          <Link
            href="/faq"
            className="inline-block bg-green text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green/90 transition-colors"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </section>
  );
}
