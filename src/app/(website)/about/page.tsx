import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { buildContentMap } from "@/lib/i18n-content";
import { PageHeroImage } from "@/components/website/PageHeroImage";

export const metadata: Metadata = {
  title: "About Us — Our Story",
  description:
    "Family-owned professional cleaning service. Learn about Havana Cleaning — trusted for quality residential and commercial cleaning since day one.",
  alternates: { canonical: "/about" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getContent(contentMap: Record<string, unknown>, key: string, fallback: Record<string, unknown>): Record<string, any> {
  return (contentMap[key] ?? fallback) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  let contentMap: Record<string, unknown> = {};

  try {
    const contentRows = await prisma.content.findMany({ where: { published: true } });
    contentMap = buildContentMap(contentRows, locale);
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  const aboutPageMedia = getContent(contentMap, "about_page_media", { heroImageUrl: "", storyImageUrl: "" });

  const aboutSection = getContent(contentMap, "about_section", {
    label: t("about.label"),
    title: t("about.title"),
    paragraphs: [t("about.p1"), t("about.p2"), t("about.p3")],
  });

  const aboutPage = getContent(contentMap, "about_page", {
    mission: locale === "es"
      ? "Ofrecer a las familias el tipo de limpieza que se siente como hogar — con corazón, esfuerzo y orgullo."
      : "To deliver families the kind of clean that feels like home — with heart, hustle, and pride.",
    values: locale === "es" ? [
      { title: "La Familia Primero", description: "Tratamos cada hogar como el nuestro. Nuestros clientes son familia, y su confianza lo es todo." },
      { title: "Fuerte Ética de Trabajo", description: "Trabajo duro, dedicación y orgullo en cada detalle — esa es la manera Havana." },
      { title: "Confianza y Transparencia", description: "Equipos verificados, precios claros y comunicación honesta. Siempre." },
      { title: "Raíces Comunitarias", description: "Fundada en Florida, creciendo a nivel nacional. Estamos orgullosos de servir a nuestras comunidades todos los días." },
    ] : [
      { title: "Family First", description: "We treat every home like our own. Our clients are family, and their trust is everything." },
      { title: "Strong Work Ethic", description: "Hard work, dedication, and pride in every detail — that's the Havana way." },
      { title: "Trust & Transparency", description: "Background-checked teams, upfront pricing, and honest communication. Always." },
      { title: "Community Roots", description: "Founded in Florida, growing nationwide. We're proud to serve our communities every single day." },
    ],
  });

  return (
    <>
      {/* HERO */}
      <section className="bg-tobacco pt-36 pb-20 px-6 md:px-20 text-center relative overflow-hidden">
        {aboutPageMedia.heroImageUrl && <PageHeroImage imageUrl={aboutPageMedia.heroImageUrl} />}
        <div className="relative z-10">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green-light mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green-light" />
            {aboutSection.label || t("about.label")}
            <span className="w-8 h-px bg-green-light" />
          </div>
          <h1
            className="font-display text-cream mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            {aboutSection.title}
          </h1>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-cream py-20 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              {(aboutSection.paragraphs as string[]).slice(0, 2).map((p: string, i: number) => (
                <p key={i} className="text-[#5a4535] text-[0.95rem] leading-relaxed">{p}</p>
              ))}
              {!aboutPageMedia.storyImageUrl && (aboutSection.paragraphs as string[]).slice(2).map((p: string, i: number) => (
                <p key={i} className="text-[#5a4535] text-[0.95rem] leading-relaxed">{p}</p>
              ))}
            </div>
            {aboutPageMedia.storyImageUrl ? (
              <div className="relative rounded-lg overflow-hidden min-h-[300px]">
                <Image src={aboutPageMedia.storyImageUrl} alt="About Havana Cleaning" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ) : (
              <div className="space-y-5">
                {(aboutSection.paragraphs as string[]).slice(2).map((p: string, i: number) => (
                  <p key={i} className="text-[#5a4535] text-[0.95rem] leading-relaxed">{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-ivory py-20 px-6 md:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-green" />
            {t("about.missionLabel")}
            <span className="w-8 h-px bg-green" />
          </div>
          <p className="font-display text-2xl md:text-3xl leading-snug max-w-2xl mx-auto mb-16">
            &ldquo;{aboutPage.mission}&rdquo;
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-cream py-20 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-[0.72rem] tracking-[0.25em] uppercase text-green mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-green" />
            {t("about.valuesLabel")}
          </div>
          <h2 className="font-display mb-12" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
            {t("about.valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(aboutPage.values as { title: string; description: string }[]).map(
              (v: { title: string; description: string }, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-tobacco/10 rounded-lg p-8"
                >
                  <h3 className="font-display text-lg mb-2 text-green">{v.title}</h3>
                  <p className="text-[#5a4535] text-[0.9rem] leading-relaxed">
                    {v.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green py-16 px-6 text-center">
        <h2 className="font-display text-white text-3xl mb-4">
          {t("about.ctaTitle")}
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          {t("about.ctaSubtitle")}
        </p>
        <Link
          href="/book"
          className="inline-block bg-gold text-tobacco px-9 py-4 text-[0.9rem] font-semibold tracking-[0.08em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          {t("about.ctaButton")}
        </Link>
      </section>
    </>
  );
}
