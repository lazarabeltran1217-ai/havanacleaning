import { BUSINESS, SERVICE_AREAS } from "./constants";

// JSON-LD builders for structured data

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "CleaningService"],
    "@id": "https://havanacleaning.com/#business",
    name: BUSINESS.name,
    description:
      "Miami's premier family-owned cleaning service. Residential, deep clean, commercial, and eco-friendly cleaning.",
    url: "https://havanacleaning.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Miami",
      addressRegion: "FL",
      postalCode: "33101",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.7617,
      longitude: -80.1918,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Miami",
        "@id": "https://www.wikidata.org/wiki/Q8652",
      },
      ...SERVICE_AREAS.map((area) => ({
        "@type": "Neighborhood",
        name: area,
        containedInPlace: { "@type": "City", name: "Miami" },
      })),
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "07:00",
        closes: "19:00",
      },
    ],
    priceRange: "$$",
    image: "https://havanacleaning.com/og-image.jpg",
    sameAs: [],
    knowsLanguage: ["en", "es"],
    paymentAccepted: ["Cash", "Credit Card", "Debit Card"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Residential Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Deep Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Move-In/Move-Out Cleaning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Eco-Friendly Cleaning" } },
      ],
    },
  };
}

export function speakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#faq summary", "#about h2"],
    },
    url: "https://havanacleaning.com",
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS.name,
    url: "https://havanacleaning.com",
    logo: "https://havanacleaning.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      url: "https://havanacleaning.com/book",
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS.name,
    url: "https://havanacleaning.com",
    inLanguage: ["en", "es"],
  };
}

export function serviceSchema(service: {
  name: string;
  description?: string | null;
  basePrice: number;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description || "",
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS.name,
    },
    areaServed: {
      "@type": "City",
      name: "Miami",
    },
    ...(service.basePrice > 0 && {
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: service.basePrice,
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          price: service.basePrice,
          unitText: "per service",
        },
      },
    }),
    url: `https://havanacleaning.com/services/${service.slug}`,
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://havanacleaning.com${item.url}`,
    })),
  };
}

export function aggregateRatingSchema(rating: number, count: number) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: rating,
    bestRating: 5,
    reviewCount: count,
    itemReviewed: {
      "@type": "LocalBusiness",
      name: BUSINESS.name,
    },
  };
}

export function reviewSchema(review: {
  author: string;
  content: string;
  rating: number;
  location?: string;
}) {
  return {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewBody: review.content,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
  };
}
