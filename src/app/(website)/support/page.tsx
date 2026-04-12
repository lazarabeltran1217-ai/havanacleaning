import type { Metadata } from "next";
import Link from "next/link";
import { Clock, HelpCircle, CreditCard, Calendar, User } from "lucide-react";
import { SupportForm } from "@/components/website/SupportForm";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get help with Havana Cleaning — FAQs, contact information, and support for bookings, payments, and account issues.",
};

export default async function SupportPage() {
  const t = await getTranslations("support");

  const supportTopics = [
    { icon: Calendar, titleKey: "topicBooking", descKey: "topicBookingDesc", href: "/faq" },
    { icon: CreditCard, titleKey: "topicPayment", descKey: "topicPaymentDesc", href: "/faq" },
    { icon: User, titleKey: "topicAccount", descKey: "topicAccountDesc", href: "/forgot-password" },
    { icon: HelpCircle, titleKey: "topicGeneral", descKey: "topicGeneralDesc", href: "/faq" },
  ];

  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl mb-2">{t("title")}</h1>
        <p className="text-sand text-sm mb-10">
          {t("subtitle")}
        </p>

        {/* Business Hours */}
        <div className="bg-white border border-tobacco/8 rounded-xl p-5 text-center mb-10 max-w-xs mx-auto">
          <Clock className="w-5 h-5 text-green mx-auto mb-2" />
          <p className="font-semibold text-sm text-tobacco">{t("businessHours")}</p>
          <p className="text-tobacco/60 text-sm">{t("businessHoursValue")}</p>
        </div>

        {/* Contact Form */}
        <h2 className="font-display text-xl mb-4">{t("contactUs")}</h2>
        <div className="mb-12">
          <SupportForm />
        </div>

        {/* Support Topics */}
        <h2 className="font-display text-xl mb-4">{t("howCanWeHelp")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {supportTopics.map((topic) => (
            <Link
              key={topic.titleKey}
              href={topic.href}
              className="bg-white border border-tobacco/8 rounded-xl p-5 hover:border-green/30 transition-colors group"
            >
              <topic.icon className="w-5 h-5 text-green mb-3 group-hover:text-green/80 transition-colors" />
              <h3 className="font-semibold text-sm text-tobacco mb-1">{t(topic.titleKey)}</h3>
              <p className="text-tobacco/60 text-xs leading-relaxed">{t(topic.descKey)}</p>
            </Link>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="bg-tobacco/5 rounded-xl p-6 text-center">
          <h2 className="font-display text-lg mb-2">{t("stillQuestions")}</h2>
          <p className="text-tobacco/60 text-sm mb-4">
            {t("checkFaq")}
          </p>
          <Link
            href="/faq"
            className="inline-block bg-green text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green/90 transition-colors"
          >
            {t("viewFaq")}
          </Link>
        </div>
      </div>
    </section>
  );
}
