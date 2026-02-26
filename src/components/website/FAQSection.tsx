"use client";

import { useState } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FAQ[];
  title?: string;
}

export function FAQSection({ faqs, title = "Frequently Asked Questions" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl text-tobacco mb-6">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                isOpen ? "border-green/30 shadow-sm" : "border-gray-100"
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-tobacco">{faq.question}</span>
                <span
                  className={`text-xl shrink-0 transition-transform duration-200 ${
                    isOpen ? "text-green rotate-45" : "text-gray-400"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 text-[0.9rem] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
