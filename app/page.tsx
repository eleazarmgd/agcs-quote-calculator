"use client";

import { useState, useRef, ChangeEvent } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  green:    "#00B23B",   // Primary Green  – AGCS Green
  blue:     "#00BAFF",   // Primary Blue   – AGCS Blue
  sky:      "#42CCFF",   // Gradient Light Blue – AGCS Sky
  limon:    "#02D649",   // Gradient Light Green – AGCS Limon
  white:    "#FFFFFF",
  text:     "#101010",   // Black – Text
  skyBack:  "#D4EAF9",   // Background Blue – AGCS SkyBack
  limBack:  "#A4D6B5",   // Background Lime – AGCS LimBack
} as const;

const HEADER_GRADIENT  = `linear-gradient(135deg, ${C.sky}, ${C.limon})`;
const CTA_GRADIENT     = `linear-gradient(135deg, ${C.sky}, ${C.limon})`;

// ─── Types ────────────────────────────────────────────────────────────────────

type FacilityType = "office" | "medical" | "warehouse" | "retail" | "school" | "other";
type SqftRange    = "under-2k" | "2k-5k" | "5k-15k" | "15k-plus";
type Restrooms    = "1-2" | "3-5" | "6-10" | "10-plus";
type FloorType    = "hardwood" | "tile" | "carpet" | "concrete" | "vct";
type Addon        = "window" | "carpet-cleaning" | "floor-care" | "restroom-deep";
type Frequency    = "daily" | "weekly" | "bi-weekly" | "monthly";

interface FormData {
  facilityType: FacilityType | null;
  sqftRange:    SqftRange    | null;
  restrooms:    Restrooms    | null;
  floorTypes:   FloorType[];
  addons:       Addon[];
  frequency:    Frequency    | null;
  photos:       File[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const FACILITY_TYPES: { id: FacilityType; label: string; icon: string }[] = [
  { id: "office",    label: "Office",          icon: "🏢" },
  { id: "medical",   label: "Medical / Clinic", icon: "🏥" },
  { id: "warehouse", label: "Warehouse",        icon: "🏭" },
  { id: "retail",    label: "Retail",           icon: "🛍️" },
  { id: "school",    label: "School / Church",  icon: "🏫" },
  { id: "other",     label: "Other",            icon: "🏗️" },
];

const SQFT_RANGES: { id: SqftRange; label: string; repSqft: number }[] = [
  { id: "under-2k",  label: "Under 2,000 sq ft",      repSqft: 1500  },
  { id: "2k-5k",     label: "2,000 – 5,000 sq ft",    repSqft: 3500  },
  { id: "5k-15k",    label: "5,000 – 15,000 sq ft",   repSqft: 10000 },
  { id: "15k-plus",  label: "15,000+ sq ft",           repSqft: 20000 },
];

const RESTROOM_RANGES: { id: Restrooms; label: string; addon: number }[] = [
  { id: "1-2",     label: "1 – 2 restrooms",  addon: 0   },
  { id: "3-5",     label: "3 – 5 restrooms",  addon: 50  },
  { id: "6-10",    label: "6 – 10 restrooms", addon: 150 },
  { id: "10-plus", label: "10+ restrooms",    addon: 300 },
];

const FLOOR_TYPES: { id: FloorType; label: string }[] = [
  { id: "hardwood", label: "Hardwood" },
  { id: "tile",     label: "Tile" },
  { id: "carpet",   label: "Carpet" },
  { id: "concrete", label: "Concrete" },
  { id: "vct",      label: "VCT (Vinyl Composite Tile)" },
];

const ADDONS: { id: Addon; label: string; description: string }[] = [
  { id: "window",         label: "Window Cleaning",     description: "Interior & exterior glass"   },
  { id: "carpet-cleaning",label: "Carpet Cleaning",     description: "Deep hot-water extraction"   },
  { id: "floor-care",     label: "Floor Care",          description: "Strip, wax & buff"           },
  { id: "restroom-deep",  label: "Restroom Deep Clean", description: "Sanitize & descale"          },
];

const FREQUENCIES: {
  id: Frequency; label: string; sub: string;
  visitsPerMonth: number; multiplier: number; badge?: string;
}[] = [
  { id: "daily",     label: "Daily",     sub: "~22 visits/mo", visitsPerMonth: 22, multiplier: 0.70, badge: "Best Value" },
  { id: "weekly",    label: "Weekly",    sub: "4 visits/mo",   visitsPerMonth: 4,  multiplier: 0.80 },
  { id: "bi-weekly", label: "Bi-Weekly", sub: "2 visits/mo",   visitsPerMonth: 2,  multiplier: 0.85 },
  { id: "monthly",   label: "Monthly",   sub: "1 visit/mo",    visitsPerMonth: 1,  multiplier: 0.90 },
];

const GHL_LINK = "https://your-ghl-link-here";

const TOTAL_STEPS  = 7;
const STEP_LABELS  = ["Facility Type","Square Footage","Restrooms","Floor Types","Add-on Services","Frequency","Your Estimate"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calcEstimate(data: FormData) {
  if (!data.sqftRange || !data.restrooms || !data.frequency) return null;
  const { repSqft }         = SQFT_RANGES.find((s) => s.id === data.sqftRange)!;
  const { addon: roomAddon }= RESTROOM_RANGES.find((r) => r.id === data.restrooms)!;
  const { visitsPerMonth, multiplier } = FREQUENCIES.find((f) => f.id === data.frequency)!;
  const addonMult = 1 + data.addons.length * 0.15;
  const low  = Math.round((0.08 * repSqft * visitsPerMonth * multiplier + roomAddon) * addonMult);
  const high = Math.round((0.12 * repSqft * visitsPerMonth * multiplier + roomAddon) * addonMult);
  return { low, high };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
function Tick({ color = "white" }: { color?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  );
}

// Single-select card — green accent
function SelectCard({ label, icon, sub, badge, selected, onClick }: {
  label: string; icon?: string; sub?: string; badge?: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer"
      style={selected
        ? { borderColor: C.green, backgroundColor: `${C.limBack}33` }
        : { borderColor: "#e5e7eb", backgroundColor: C.white }
      }
    >
      {badge && (
        <span
          className="absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: C.blue }}
        >
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3 pr-7">
        {icon && <span className="text-2xl leading-none">{icon}</span>}
        <div>
          <span className="block font-semibold text-sm leading-snug" style={{ color: selected ? C.green : C.text }}>
            {label}
          </span>
          {sub && <span className="block text-xs mt-0.5" style={{ color: "#9ca3af" }}>{sub}</span>}
        </div>
      </div>
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
        style={selected
          ? { borderColor: C.green, backgroundColor: C.green }
          : { borderColor: "#d1d5db", backgroundColor: "transparent" }
        }
      >
        {selected && <Tick />}
      </span>
    </button>
  );
}

// Multi-select card — blue accent
function CheckCard({ label, description, checked, onChange }: {
  label: string; description?: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer"
      style={checked
        ? { borderColor: C.blue, backgroundColor: `${C.skyBack}80` }
        : { borderColor: "#e5e7eb", backgroundColor: C.white }
      }
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all"
          style={checked
            ? { borderColor: C.blue, backgroundColor: C.blue }
            : { borderColor: "#d1d5db", backgroundColor: C.white }
          }
        >
          {checked && <Tick />}
        </span>
        <div>
          <span className="block font-semibold text-sm" style={{ color: checked ? C.blue : C.text }}>
            {label}
          </span>
          {description && <span className="block text-xs mt-0.5 text-gray-400">{description}</span>}
        </div>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [step,     setStep]    = useState(0);
  const [dir,      setDir]     = useState<"forward"|"back">("forward");
  const [animKey,  setAnimKey] = useState(0);
  const [data,     setData]    = useState<FormData>({
    facilityType: null, sqftRange: null, restrooms: null,
    floorTypes: [], addons: [], frequency: null, photos: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function go(next: number, direction: "forward"|"back") {
    setDir(direction);
    setAnimKey((k) => k + 1);
    setStep(next);
  }
  function handleNext() { if (step < TOTAL_STEPS - 1) go(step + 1, "forward"); }
  function handleBack() { if (step > 0)               go(step - 1, "back");    }

  function toggleFloor(id: FloorType) {
    setData((d) => ({
      ...d,
      floorTypes: d.floorTypes.includes(id)
        ? d.floorTypes.filter((f) => f !== id)
        : [...d.floorTypes, id],
    }));
  }
  function toggleAddon(id: Addon, v: boolean) {
    setData((d) => ({ ...d, addons: v ? [...d.addons, id] : d.addons.filter((a) => a !== id) }));
  }
  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setData((d) => ({ ...d, photos: [...d.photos, ...files] }));
  }

  const canContinue =
    (step === 0 && data.facilityType !== null) ||
    (step === 1 && data.sqftRange    !== null) ||
    (step === 2 && data.restrooms    !== null) ||
    (step === 3 && data.floorTypes.length > 0) ||
    step === 4 ||
    (step === 5 && data.frequency    !== null) ||
    step === 6;

  const estimate    = calcEstimate(data);
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;
  const animClass   = dir === "forward" ? "step-slide-forward" : "step-slide-back";

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.white }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden shadow-md shrink-0" style={{ background: HEADER_GRADIENT }}>
        {/* dot texture overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-lg px-4 pt-5 pb-1 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
            AG Cleaning Solutions
          </p>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Get Your Free Quote</h1>
        </div>

        {/* Progress bar */}
        <div className="relative mx-auto max-w-lg px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-semibold text-white">{STEP_LABELS[step]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Step Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
          <div key={animKey} className={animClass}>

            {/* Step 0 – Facility Type */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>What type of facility?</h2>
                <p className="text-sm text-gray-500 mb-5">Select the option that best describes your space.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {FACILITY_TYPES.map((ft) => (
                    <SelectCard key={ft.id} label={ft.label} icon={ft.icon}
                      selected={data.facilityType === ft.id}
                      onClick={() => setData((d) => ({ ...d, facilityType: ft.id }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 – Square Footage */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>How large is your facility?</h2>
                <p className="text-sm text-gray-500 mb-5">This helps us estimate the scope of work.</p>
                <div className="flex flex-col gap-3">
                  {SQFT_RANGES.map((r) => (
                    <SelectCard key={r.id} label={r.label}
                      selected={data.sqftRange === r.id}
                      onClick={() => setData((d) => ({ ...d, sqftRange: r.id }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 – Restrooms */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>How many restrooms?</h2>
                <p className="text-sm text-gray-500 mb-5">Restrooms require additional time and supplies.</p>
                <div className="flex flex-col gap-3">
                  {RESTROOM_RANGES.map((r) => (
                    <SelectCard key={r.id} label={r.label}
                      selected={data.restrooms === r.id}
                      onClick={() => setData((d) => ({ ...d, restrooms: r.id }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 – Floor Types */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>What floor types do you have?</h2>
                <p className="text-sm text-gray-500 mb-5">Select all that apply.</p>
                <div className="flex flex-col gap-3">
                  {FLOOR_TYPES.map((ft) => (
                    <CheckCard key={ft.id} label={ft.label}
                      checked={data.floorTypes.includes(ft.id)}
                      onChange={() => toggleFloor(ft.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 – Add-ons */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>Any add-on services?</h2>
                <p className="text-sm text-gray-500 mb-5">Optional — each one adds ~15% to your estimate.</p>
                <div className="flex flex-col gap-3">
                  {ADDONS.map((a) => (
                    <CheckCard key={a.id} label={a.label} description={a.description}
                      checked={data.addons.includes(a.id)}
                      onChange={(v) => toggleAddon(a.id, v)}
                    />
                  ))}
                </div>
                {data.addons.length === 0 && (
                  <p className="mt-4 text-center text-xs text-gray-400">
                    No add-ons selected — you can continue without any.
                  </p>
                )}
              </div>
            )}

            {/* Step 5 – Frequency */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>How often do you need cleaning?</h2>
                <p className="text-sm text-gray-500 mb-5">More frequent visits lower your per-visit rate.</p>
                <div className="flex flex-col gap-3">
                  {FREQUENCIES.map((f) => (
                    <SelectCard key={f.id} label={f.label} sub={f.sub} badge={f.badge}
                      selected={data.frequency === f.id}
                      onClick={() => setData((d) => ({ ...d, frequency: f.id }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 6 – Results */}
            {step === 6 && (
              <div>

                {/* ── Estimate card — solid SkyBack, NO gradient ── */}
                <div
                  className="rounded-2xl p-6 text-center mb-5 shadow-sm border"
                  style={{ backgroundColor: C.skyBack, borderColor: `${C.blue}33` }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: C.blue }}>
                    Estimated Monthly Cost
                  </p>
                  <p className="text-4xl font-bold sm:text-5xl leading-tight" style={{ color: C.text }}>
                    {estimate ? (
                      <>
                        <span style={{ color: C.green }}>{fmt(estimate.low)}</span>
                        <span className="text-xl font-semibold mx-2" style={{ color: "#9ca3af" }}>–</span>
                        <span style={{ color: C.green }}>{fmt(estimate.high)}</span>
                        <span className="text-base font-normal ml-1" style={{ color: "#6b7280" }}>/mo</span>
                      </>
                    ) : "—"}
                  </p>
                  {data.addons.length > 0 && (
                    <p className="mt-2 text-xs" style={{ color: C.blue }}>
                      Includes {data.addons.length} add-on{data.addons.length > 1 ? "s" : ""}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] italic text-gray-400">
                    Estimate only — final price based on site assessment.
                  </p>
                </div>

                {/* ── Summary pills ── */}
                <div className="mb-5 flex flex-wrap gap-2">
                  {[
                    FACILITY_TYPES.find((f) => f.id === data.facilityType)?.label,
                    SQFT_RANGES.find((s) => s.id === data.sqftRange)?.label,
                    RESTROOM_RANGES.find((r) => r.id === data.restrooms)?.label,
                    FREQUENCIES.find((f) => f.id === data.frequency)?.label,
                    ...data.floorTypes.map((ft) => FLOOR_TYPES.find((f) => f.id === ft)?.label),
                    ...data.addons.map((a) => ADDONS.find((x) => x.id === a)?.label),
                  ].filter(Boolean).map((label) => (
                    <span
                      key={label}
                      className="rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${C.limBack}40`, borderColor: `${C.green}55`, color: C.text }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* ── Photo upload ── */}
                <div
                  className="rounded-xl border-2 border-dashed p-5 text-center mb-5 transition-colors cursor-pointer"
                  style={{ borderColor: "#d1d5db", backgroundColor: C.white }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.green)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                    fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="mx-auto mb-2">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: C.text }}>
                    Upload photos of your facility
                  </p>
                  <p className="text-xs text-gray-400 mb-3">for a more accurate quote</p>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-gray-50"
                    style={{ borderColor: "#d1d5db", color: "#4b5563" }}>
                    Choose Photos
                  </span>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                  {data.photos.length > 0 && (
                    <p className="mt-3 text-xs font-semibold" style={{ color: C.green }}>
                      ✓ {data.photos.length} photo{data.photos.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                {/* ── CTA — gradient, tied to header ── */}
                <a
                  href={GHL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-md transition-all duration-150 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  style={{ background: CTA_GRADIENT }}
                >
                  Request Full Quote
                  <ChevronRight />
                </a>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Sticky Footer Nav ──────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 shrink-0 border-t px-4 py-3 sm:px-6"
        style={{ borderColor: "#e5e7eb", backgroundColor: C.white }}>
        <div className="mx-auto flex max-w-lg items-center gap-3">

          {step > 0 ? (
            <button type="button" onClick={handleBack}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 shrink-0"
              style={{ borderColor: "#d1d5db", color: "#4b5563" }}>
              <ChevronLeft />
              Back
            </button>
          ) : (
            <div className="shrink-0 w-[72px]" />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button type="button" onClick={handleNext} disabled={!canContinue}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-200",
                canContinue
                  ? "shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95"
                  : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              style={{ backgroundColor: canContinue ? C.green : "#9ca3af" }}
            >
              {step === TOTAL_STEPS - 2 ? "See My Estimate" : "Continue"}
              <ChevronRight />
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </footer>

    </div>
  );
}
