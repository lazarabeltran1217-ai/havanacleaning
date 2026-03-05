import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Havana Cleaning terms of service — booking policies, cancellation, payments, and service agreements.",
};

export default function TermsOfServicePage() {
  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl mb-2">Terms of Service</h1>
        <p className="text-sand text-sm mb-10">Last updated: March 4, 2026</p>

        <div className="prose prose-tobacco max-w-none space-y-8 text-[0.92rem] leading-relaxed">
          <div>
            <h2 className="font-display text-xl mb-3">1. Acceptance of Terms</h2>
            <p className="text-tobacco/80">
              By accessing or using Havana Cleaning&apos;s website, mobile app, or services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">2. Services</h2>
            <p className="text-tobacco/80">
              Havana Cleaning provides residential and commercial cleaning services. Service availability, pricing, and scheduling are subject to change. We reserve the right to decline service at our discretion.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">3. Booking & Scheduling</h2>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1">
              <li>Bookings are confirmed once payment is processed or a valid payment method is on file.</li>
              <li>You agree to provide accurate address, access instructions, and contact information.</li>
              <li>You must ensure safe, reasonable access to the property for our cleaning professionals.</li>
              <li>We reserve the right to reschedule due to weather, staffing, or safety concerns.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">4. Cancellation & Rescheduling</h2>
            <ul className="list-disc pl-6 text-tobacco/80 space-y-1">
              <li><strong>24+ hours notice:</strong> Free cancellation or rescheduling.</li>
              <li><strong>Less than 24 hours:</strong> A cancellation fee of up to 50% of the service cost may apply.</li>
              <li><strong>No-shows:</strong> Full service charge may apply if our team arrives and cannot access the property.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">5. Payments</h2>
            <p className="text-tobacco/80">
              All payments are processed securely through Stripe. Prices shown at the time of booking are final unless additional services are requested on-site. We accept major credit and debit cards.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">6. Satisfaction Guarantee</h2>
            <p className="text-tobacco/80">
              If you are not satisfied with our cleaning, please contact us within 24 hours of service completion. We will work to resolve your concern, which may include a re-clean at no additional charge.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">7. Liability</h2>
            <p className="text-tobacco/80">
              Havana Cleaning carries general liability insurance. We take care of your property, but our liability for any damage is limited to the cost of the cleaning service. We are not responsible for pre-existing damage, normal wear, or items of extraordinary value unless disclosed prior to service.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">8. User Accounts</h2>
            <p className="text-tobacco/80">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to notify us immediately of any unauthorized use of your account.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">9. Intellectual Property</h2>
            <p className="text-tobacco/80">
              All content on our website and app, including text, graphics, logos, and software, is the property of Havana Cleaning and protected by applicable intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">10. Termination</h2>
            <p className="text-tobacco/80">
              We may suspend or terminate your account if you violate these terms, misuse our services, or engage in behavior that is harmful to our staff or other users.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">11. Changes to Terms</h2>
            <p className="text-tobacco/80">
              We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">12. Contact</h2>
            <p className="text-tobacco/80">
              For questions about these terms, contact us at:
            </p>
            <p className="text-tobacco/80 mt-2">
              <strong>Havana Cleaning</strong><br />
              Email: legal@havanacleaning.com<br />
              Phone: (305) 555-0100
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
