"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLEANING_TYPES = [
  "Residential",
  "Commercial",
  "Post-Construction",
  "Airbnb/Vacation Rental",
  "Deep Clean",
  "Move-In/Move-Out",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["Morning (7am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)"];

export function CareerApplication() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Personal Info
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Miami");
  const [zip, setZip] = useState("");

  // Step 2 — Eligibility
  const [authorizedToWork, setAuthorizedToWork] = useState(true);
  const [requiresSponsorship, setRequiresSponsorship] = useState(false);
  const [felonyConviction, setFelonyConviction] = useState(false);
  const [felonyExplanation, setFelonyExplanation] = useState("");
  const [hasDriversLicense, setHasDriversLicense] = useState(true);
  const [hasTransportation, setHasTransportation] = useState(true);

  // Step 3 — Experience
  const [yearsExperience, setYearsExperience] = useState("0");
  const [cleaningTypes, setCleaningTypes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [ecoExperience, setEcoExperience] = useState(false);
  const [specialSkills, setSpecialSkills] = useState("");

  // Step 4 — Availability
  const [employmentType, setEmploymentType] = useState("Full-Time");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [desiredRate, setDesiredRate] = useState("Open to discussion");

  // Step 5 — References
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Phone, setRef1Phone] = useState("");
  const [ref1Relation, setRef1Relation] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Phone, setRef2Phone] = useState("");
  const [ref2Relation, setRef2Relation] = useState("");

  // Step 6 — Agreement
  const [electronicSignature, setElectronicSignature] = useState("");
  const [consentBackgroundCheck, setConsentBackgroundCheck] = useState(false);
  const [consentDrugScreen, setConsentDrugScreen] = useState(false);

  // Honeypot
  const [honeypot, setHoneypot] = useState("");

  function toggleArray(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item]);
  }

  async function handleSubmit() {
    if (honeypot) return; // Bot detected
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, middleName, lastName, phone, email,
          street, city, state: "FL", zip,
          authorizedToWork, requiresSponsorship,
          felonyConviction, felonyExplanation,
          hasDriversLicense, hasTransportation,
          yearsExperience, cleaningTypes, languages, ecoExperience, specialSkills,
          employmentType, availableDays, availableHours, desiredRate,
          references: [
            { name: ref1Name, phone: ref1Phone, relationship: ref1Relation },
            { name: ref2Name, phone: ref2Phone, relationship: ref2Relation },
          ],
          electronicSignature, consentBackgroundCheck, consentDrugScreen,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Submission failed");
        setLoading(false);
        return;
      }

      router.push("/careers/success");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const totalSteps = 6;

  const inputClass =
    "w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem] bg-white";
  const labelClass =
    "block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5";

  return (
    <div>
      {/* PROGRESS */}
      <div className="flex items-center justify-center mb-8 gap-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-semibold ${
                s <= step ? "bg-green text-white" : "bg-tobacco/10 text-tobacco/40"
              }`}
            >
              {s}
            </div>
            {s < totalSteps && (
              <div className={`w-8 h-0.5 ${s < step ? "bg-green" : "bg-tobacco/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Honeypot (hidden) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="bg-white border border-tobacco/10 rounded-lg p-8">
        {/* STEP 1 — Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display text-lg mb-4">Personal Information</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Street Address *</label>
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ZIP Code *</label>
                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} required className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Eligibility */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-display text-lg mb-4">Employment Eligibility</h3>
            {[
              { label: "Are you authorized to work in the United States?", value: authorizedToWork, setter: setAuthorizedToWork },
              { label: "Will you require sponsorship?", value: requiresSponsorship, setter: setRequiresSponsorship },
              { label: "Have you been convicted of a felony?", value: felonyConviction, setter: setFelonyConviction },
              { label: "Do you have a valid driver's license?", value: hasDriversLicense, setter: setHasDriversLicense },
              { label: "Do you have reliable transportation?", value: hasTransportation, setter: setHasTransportation },
            ].map((q) => (
              <div key={q.label} className="flex items-center justify-between">
                <span className="text-[0.9rem]">{q.label}</span>
                <div className="flex gap-2">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => q.setter(opt === "Yes")}
                      className={`px-4 py-1.5 rounded-md text-[0.82rem] border transition-colors ${
                        (opt === "Yes") === q.value
                          ? "bg-green text-white border-green"
                          : "border-tobacco/15 hover:border-green/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {felonyConviction && (
              <div>
                <label className={labelClass}>Please Explain</label>
                <textarea
                  value={felonyExplanation}
                  onChange={(e) => setFelonyExplanation(e.target.value)}
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Experience */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-display text-lg mb-4">Experience & Skills</h3>
            <div>
              <label className={labelClass}>Years of Cleaning Experience</label>
              <select value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputClass}>
                {["0", "Less than 1", "1-2", "3-5", "5+"].map((y) => (
                  <option key={y} value={y}>{y === "0" ? "No experience" : y + " years"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Types of Cleaning Experience</label>
              <div className="grid grid-cols-2 gap-2">
                {CLEANING_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleArray(cleaningTypes, t, setCleaningTypes)}
                    className={`border rounded-md px-3 py-2 text-[0.82rem] text-left transition-colors ${
                      cleaningTypes.includes(t) ? "border-green bg-green/5" : "border-tobacco/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Languages Spoken</label>
              <div className="flex gap-2">
                {["English", "Spanish", "Portuguese", "Creole"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleArray(languages, l, setLanguages)}
                    className={`border rounded-md px-4 py-2 text-[0.82rem] transition-colors ${
                      languages.includes(l) ? "border-green bg-green/5" : "border-tobacco/10"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.9rem]">Experience with eco-friendly products?</span>
              <div className="flex gap-2">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEcoExperience(opt === "Yes")}
                    className={`px-4 py-1.5 rounded-md text-[0.82rem] border transition-colors ${
                      (opt === "Yes") === ecoExperience ? "bg-green text-white border-green" : "border-tobacco/15"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Special Skills (optional)</label>
              <textarea
                value={specialSkills}
                onChange={(e) => setSpecialSkills(e.target.value)}
                rows={2}
                placeholder="Carpet cleaning, window cleaning, organizing, etc."
                className={inputClass + " resize-none"}
              />
            </div>
          </div>
        )}

        {/* STEP 4 — Availability */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-display text-lg mb-4">Availability & Preferences</h3>
            <div>
              <label className={labelClass}>Employment Type</label>
              <div className="flex gap-2">
                {["Full-Time", "Part-Time", "Contract"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEmploymentType(t)}
                    className={`border rounded-md px-5 py-2 text-[0.82rem] transition-colors ${
                      employmentType === t ? "border-green bg-green/5" : "border-tobacco/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleArray(availableDays, d, setAvailableDays)}
                    className={`border rounded-md px-3 py-1.5 text-[0.8rem] transition-colors ${
                      availableDays.includes(d) ? "border-green bg-green/5" : "border-tobacco/10"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Preferred Hours</label>
              <div className="flex flex-wrap gap-2">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleArray(availableHours, h, setAvailableHours)}
                    className={`border rounded-md px-3 py-1.5 text-[0.8rem] transition-colors ${
                      availableHours.includes(h) ? "border-green bg-green/5" : "border-tobacco/10"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Desired Hourly Rate</label>
              <select value={desiredRate} onChange={(e) => setDesiredRate(e.target.value)} className={inputClass}>
                <option>Open to discussion</option>
                <option>$15-18/hr</option>
                <option>$18-22/hr</option>
                <option>$22-25/hr</option>
                <option>$25+/hr</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 5 — References */}
        {step === 5 && (
          <div className="space-y-5">
            <h3 className="font-display text-lg mb-4">References</h3>
            <div className="space-y-4">
              <p className="text-sand text-[0.85rem]">Please provide at least 2 professional or personal references.</p>
              <div className="border border-tobacco/10 rounded-lg p-5 space-y-3">
                <div className="text-[0.78rem] uppercase tracking-wider text-sand font-semibold">Reference 1 *</div>
                <input type="text" placeholder="Full Name" value={ref1Name} onChange={(e) => setRef1Name(e.target.value)} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Phone" value={ref1Phone} onChange={(e) => setRef1Phone(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Relationship" value={ref1Relation} onChange={(e) => setRef1Relation(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="border border-tobacco/10 rounded-lg p-5 space-y-3">
                <div className="text-[0.78rem] uppercase tracking-wider text-sand font-semibold">Reference 2 *</div>
                <input type="text" placeholder="Full Name" value={ref2Name} onChange={(e) => setRef2Name(e.target.value)} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Phone" value={ref2Phone} onChange={(e) => setRef2Phone(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Relationship" value={ref2Relation} onChange={(e) => setRef2Relation(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — Agreement */}
        {step === 6 && (
          <div className="space-y-5">
            <h3 className="font-display text-lg mb-4">Agreement & Signature</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentBackgroundCheck}
                  onChange={(e) => setConsentBackgroundCheck(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-green"
                />
                <span className="text-[0.85rem] text-[#5a4535]">
                  I consent to a background check as part of the hiring process.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentDrugScreen}
                  onChange={(e) => setConsentDrugScreen(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-green"
                />
                <span className="text-[0.85rem] text-[#5a4535]">
                  I agree to a drug screening if required by the employer.
                </span>
              </label>
              <div className="bg-ivory border border-tobacco/10 rounded-lg p-4 text-[0.82rem] text-[#7a6555]">
                I certify that the information in this application is correct. I understand
                that any misrepresentation may result in disqualification. I acknowledge
                that employment is at-will and either party may terminate the relationship
                at any time.
              </div>
              <div>
                <label className={labelClass}>Electronic Signature (type your full name) *</label>
                <input
                  type="text"
                  value={electronicSignature}
                  onChange={(e) => setElectronicSignature(e.target.value)}
                  placeholder="Your Full Legal Name"
                  className={inputClass + " font-serif italic"}
                />
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        {error && (
          <div className="mt-4 text-red text-[0.85rem] bg-red/10 border border-red/20 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-tobacco/20 rounded-[3px] text-[0.85rem] hover:bg-tobacco/5 transition-colors"
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-gold text-tobacco py-3 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !electronicSignature || !consentBackgroundCheck}
              className="flex-1 bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
