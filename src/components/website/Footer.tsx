import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-tobacco pt-[70px] pb-10 px-6 md:px-20 border-t-[3px] border-green">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
        {/* Brand */}
        <div className="lg:col-span-2">
          <span className="font-display text-[1.6rem] font-black text-amber block mb-4">
            Havana <span className="text-green-light italic">Cleaning</span>
          </span>
          <p className="text-sand text-[0.88rem] leading-relaxed">{t("tagline")}</p>
          {/* Social Icons */}
          <div className="flex gap-3 mt-5">
            {["Facebook", "Instagram", "TikTok", "Yelp", "Google"].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center hover:bg-green hover:border-green transition-colors group"
              >
                <span className="text-sand text-xs group-hover:text-white transition-colors">{name[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-green-light text-[0.72rem] tracking-[0.2em] uppercase mb-5 font-semibold">{t("servicesTitle")}</h4>
          <ul className="space-y-2.5">
            {[
              { key: "residential", slug: "residential-cleaning" },
              { key: "deepClean", slug: "deep-cleaning" },
              { key: "moveInOut", slug: "move-in-move-out" },
              { key: "commercial", slug: "commercial-cleaning" },
              { key: "postConstruction", slug: "post-construction" },
              { key: "airbnbTurnover", slug: "airbnb-turnover" },
            ].map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t(s.key)}</Link></li>
            ))}
            <li><Link href="/handyman" className="text-green-light text-[0.88rem] hover:text-white transition-colors font-medium">{t("handyman")}</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-green-light text-[0.72rem] tracking-[0.2em] uppercase mb-5 font-semibold">{t("companyTitle")}</h4>
          <ul className="space-y-2.5">
            <li><Link href="/#about" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("aboutUs")}</Link></li>
            <li><Link href="/#about" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("ourTeam")}</Link></li>
            <li><Link href="/#testimonials" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("reviews")}</Link></li>
            <li><Link href="/blog" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("blog")}</Link></li>
            <li><Link href="/areas" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("serviceAreas")}</Link></li>
            <li><Link href="/careers" className="text-green-light text-[0.88rem] hover:text-white transition-colors font-medium">{t("careers")}</Link></li>
            <li><Link href="/support" className="text-sand text-[0.88rem] hover:text-cream transition-colors">Help & Support</Link></li>
            <li><Link href="/privacy" className="text-sand text-[0.88rem] hover:text-cream transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sand text-[0.88rem] hover:text-cream transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-green-light text-[0.72rem] tracking-[0.2em] uppercase mb-5 font-semibold">{t("contactTitle")}</h4>
          <ul className="space-y-2.5">
            <li><span className="text-sand text-[0.88rem]">{t("location")}</span></li>
            <li><span className="text-sand text-[0.88rem]">{t("locationNYC")}</span></li>
            <li><Link href="/book" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("bookOnline")}</Link></li>
            <li><Link href="/faq" className="text-sand text-[0.88rem] hover:text-cream transition-colors">{t("faq")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.08] pt-7 flex flex-col md:flex-row justify-between items-center text-[0.8rem] text-sand/50 gap-4">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <div className="flex gap-3 items-center">
          <a href="/api/locale?locale=en" className="text-green-light text-[0.82rem] font-semibold">English</a>
          <span className="opacity-30">|</span>
          <a href="/api/locale?locale=es" className="text-sand text-[0.82rem] hover:text-white">Español</a>
        </div>
        <span>{t("madeWith")}</span>
      </div>
    </footer>
  );
}
