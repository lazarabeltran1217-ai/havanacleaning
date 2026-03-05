import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Havana Cleaning privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-sand text-sm mb-10">Last updated: March 4, 2026</p>

        <div className="prose prose-tobacco max-w-none space-y-8 text-[0.92rem] leading-relaxed">
          <div>
            <h2 className="font-display text-xl mb-3">1. Information We Collect</h2>
            <p className="text-tobacco/80">
              When you use Havana Cleaning&apos;s services, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1 mt-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and home/business address when you create an account or book a cleaning.</li>
              <li><strong>Payment Information:</strong> Payment details are processed securely through Stripe. We do not store your full credit card number on our servers.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website and app, including pages visited, booking history, and device information.</li>
              <li><strong>Communications:</strong> Records of your communications with us, including support requests and feedback.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1">
              <li>To provide, maintain, and improve our cleaning services</li>
              <li>To process bookings and payments</li>
              <li>To send booking confirmations, reminders, and service updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To personalize your experience and recommend services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">3. Information Sharing</h2>
            <p className="text-tobacco/80">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1 mt-2">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Stripe for payments, Google for authentication).</li>
              <li><strong>Cleaning Staff:</strong> Your name, address, and booking details are shared with assigned cleaning professionals to perform the service.</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">4. Cookies & Tracking</h2>
            <p className="text-tobacco/80">
              We use essential cookies to keep you signed in and remember your preferences. We use Google Analytics to understand how our website is used. You can disable cookies in your browser settings.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">5. Data Security</h2>
            <p className="text-tobacco/80">
              We implement industry-standard security measures to protect your information, including encryption in transit (HTTPS) and at rest. Payment processing is handled by Stripe, which is PCI DSS compliant.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">6. Your Rights</h2>
            <p className="text-tobacco/80">You have the right to:</p>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1 mt-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">7. Children&apos;s Privacy</h2>
            <p className="text-tobacco/80">
              Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">8. Changes to This Policy</h2>
            <p className="text-tobacco/80">
              We may update this privacy policy from time to time. We will notify you of significant changes by posting the updated policy on our website and updating the &quot;Last updated&quot; date.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">9. Contact Us</h2>
            <p className="text-tobacco/80">
              If you have questions about this privacy policy or your personal data, please contact us at:
            </p>
            <p className="text-tobacco/80 mt-2">
              <strong>Havana Cleaning</strong><br />
              Email: privacy@havanacleaning.com<br />
              Phone: (305) 555-0100
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
