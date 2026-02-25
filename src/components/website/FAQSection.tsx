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
    <section className="py-12">
      <h2 className="font-display text-2xl text-tobacco text-center mb-8">{title}</h2>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium text-tobacco">{faq.question}</span>
                <span className="text-gray-400 text-xl shrink-0">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-gray-600 text-[0.9rem] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
