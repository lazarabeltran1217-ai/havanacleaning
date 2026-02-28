"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const INDUSTRY_KEYS = [
  "industryOffice",
  "industryRetail",
  "industryMedical",
  "industryRestaurant",
  "industryWarehouse",
  "industryConstruction",
  "industryOther",
] as const;

const SERVICE_TYPE_KEYS = [
  "serviceDaily",
  "serviceWeekly",
  "serviceBiWeekly",
  "serviceMonthly",
  "serviceOneTime",
  "servicePostConstruction",
  "serviceSpecialEvent",
] as const;

const AREA_KEYS = [
  "areaOffices",
  "areaRestrooms",
  "areaBreakRooms",
  "areaLobby",
  "areaConference",
  "areaWarehouse",
  "areaExterior",
] as const;

const SQFT_KEYS = [
  "sqftUnder1000",
  "sqft1000to2500",
  "sqft2500to5000",
  "sqft5000to10000",
  "sqft10000plus",
] as const;

const BUDGET_KEYS = [
  "budgetUnder500",
  "budget500to1000",
  "budget1000to2500",
  "budget2500to5000",
  "budget5000plus",
  "budgetNeedQuote",
] as const;

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com"];

export function CommercialForm() {
  const router = useRouter();
  const t = useTranslations("commercialForm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formLoadTime = useRef(Date.now());

  // Company Info
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Property
  const [propertyAddress, setPropertyAddress] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [floors, setFloors] = useState(1);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Anti-bot
  const [honeypot1, setHoneypot1] = useState("");
  const [honeypot2, setHoneypot2] = useState("");
  const [jsToken, setJsToken] = useState("");

  // Generate JS challenge token on mount
  useEffect(() => {
    setJsToken(btoa(String(Date.now())));
  }, []);

  function toggleArray(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (honeypot1 || honeypot2) return;

    // Time-based validation (must be open > 30 seconds)
    if (Date.now() - formLoadTime.current < 30000) {
      setError(t("errorTooFast"));
      return;
    }

    // Business email validation
    const emailDomain = contactEmail.split("@")[1]?.toLowerCase();
    if (FREE_EMAIL_DOMAINS.includes(emailDomain)) {
      setError(t("errorBusinessEmail"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          website,
          contactName,
          contactTitle,
          contactEmail,
          contactPhone,
          propertyAddress,
          squareFootage,
          floors,
          serviceTypes,
          areas,
          budgetRange,
          specialRequirements,
          jsToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errorGeneric"));
        setLoading(false);
        return;
      }

      router.push("/commercial/success");
    } catch {
      setError(t("errorGeneric"));
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem] bg-white";
  const labelClass =
    "block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-tobacco/10 rounded-lg p-8 space-y-8"
    >
      {/* Honeypots (hidden) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} value={honeypot1} onChange={(e) => setHoneypot1(e.target.value)} />
        <input tabIndex={-1} value={honeypot2} onChange={(e) => setHoneypot2(e.target.value)} />
      </div>

      {/* COMPANY INFO */}
      <div>
        <h3 className="font-display text-lg mb-4">{t("companyInfo")}</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>{t("companyName")}</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("industry")}</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
                <option value="">{t("select")}</option>
                {INDUSTRY_KEYS.map((key) => <option key={key} value={key}>{t(key)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("companyWebsite")}</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div>
        <h3 className="font-display text-lg mb-4">{t("contactPerson")}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("fullName")}</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("jobTitle")}</label>
              <input type="text" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("businessEmail")}</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("phone")}</label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* PROPERTY */}
      <div>
        <h3 className="font-display text-lg mb-4">{t("serviceDetails")}</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t("propertyAddress")}</label>
            <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("squareFootage")}</label>
              <select value={squareFootage} onChange={(e) => setSquareFootage(e.target.value)} className={inputClass}>
                <option value="">{t("select")}</option>
                {SQFT_KEYS.map((key) => <option key={key} value={key}>{t(key)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("numberOfFloors")}</label>
              <select value={floors} onChange={(e) => setFloors(Number(e.target.value))} className={inputClass}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("serviceTypesNeeded")}</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleArray(serviceTypes, key, setServiceTypes)}
                  className={`border rounded-md px-3 py-2 text-[0.82rem] text-left transition-colors ${
                    serviceTypes.includes(key) ? "border-green bg-green/5" : "border-tobacco/10"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("areasToClean")}</label>
            <div className="grid grid-cols-2 gap-2">
              {AREA_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleArray(areas, key, setAreas)}
                  className={`border rounded-md px-3 py-2 text-[0.82rem] text-left transition-colors ${
                    areas.includes(key) ? "border-green bg-green/5" : "border-tobacco/10"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("budgetRange")}</label>
            <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} className={inputClass}>
              <option value="">{t("select")}</option>
              {BUDGET_KEYS.map((key) => <option key={key} value={key}>{t(key)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t("specialRequirements")}</label>
            <textarea
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={3}
              placeholder={t("specialPlaceholder")}
              className={inputClass + " resize-none"}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red text-[0.85rem] bg-red/10 border border-red/20 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {loading ? t("submitting") : t("requestQuote")}
      </button>
    </form>
  );
}
