"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = "janitorial" | "post-construction" | "floor-care";
type SqftRange = "under-2k" | "2k-5k" | "5k-15k" | "15k-plus";
type Frequency =
  | "one-time"
  | "daily"
  | "weekly"
  | "bi-weekly"
  | "monthly";

// ─── Static Data ──────────────────────────────────────────────────────────────

const SERVICES: {
  id: ServiceType;
  label: string;
  description: string;
  rateMin: number;
  rateMax: number;
  oneTimeOnly: boolean;
}[] = [
  {
    id: "janitorial",
    label: "Janitorial",
    description: "Ongoing commercial cleaning & maintenance",
    rateMin: 0.08,
    rateMax: 0.12,
    oneTimeOnly: false,
  },
  {
    id: "post-construction",
    label: "Post-Construction",
    description: "Deep clean after construction or renovation",
    rateMin: 0.18,
    rateMax: 0.25,
    oneTimeOnly: true,
  },
  {
    id: "floor-care",
    label: "Floor Care",
    description: "Stripping, waxing, buffing & maintenance",
    rateMin: 0.12,
    rateMax: 0.18,
    oneTimeOnly: false,
  },
];

const SQFT_RANGES: {
  id: SqftRange;
  label: string;
  repSqft: number;
}[] = [
  { id: "under-2k", label: "Under 2,000 sq ft", repSqft: 1500 },
  { id: "2k-5k", label: "2,000 – 5,000 sq ft", repSqft: 3500 },
  { id: "5k-15k", label: "5,000 – 15,000 sq ft", repSqft: 10000 },
  { id: "15k-plus", label: "15,000+ sq ft", repSqft: 20000 },
];

const FREQUENCIES: {
  id: Frequency;
  label: string;
  visitsPerMonth: number;
  multiplier: number;
}[] = [
  { id: "one-time", label: "One-Time", visitsPerMonth: 1, multiplier: 1.0 },
  { id: "daily", label: "Daily", visitsPerMonth: 22, multiplier: 0.7 },
  { id: "weekly", label: "Weekly", visitsPerMonth: 4, multiplier: 0.8 },
  { id: "bi-weekly", label: "Bi-Weekly", visitsPerMonth: 2, multiplier: 0.85 },
  { id: "monthly", label: "Monthly", visitsPerMonth: 1, multiplier: 0.9 },
];

const GHL_LINK = "https://your-ghl-link-here";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function calcMonthlyRange(
  service: ServiceType,
  sqft: SqftRange,
  freq: Frequency
) {
  const svc = SERVICES.find((s) => s.id === service)!;
  const sqftData = SQFT_RANGES.find((s) => s.id === sqft)!;
  const freqData = FREQUENCIES.find((f) => f.id === freq)!;

  const visits = freqData.visitsPerMonth;
  const mult = freqData.multiplier;
  const sf = sqftData.repSqft;

  const low = svc.rateMin * mult * visits * sf;
  const high = svc.rateMax * mult * visits * sf;

  return { low, high, visits };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepLabel({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white text-sm font-bold">
        {number}
      </span>
      <h2 className="font-semibold text-gray-800 text-base">{text}</h2>
    </div>
  );
}

function OptionCard<T extends string>({
  id,
  label,
  description,
  selected,
  disabled,
  onClick,
}: {
  id: T;
  label: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: (id: T) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(id)}
      className={[
        "w-full rounded-lg border-2 px-4 py-3 text-left transition-all duration-150",
        selected
          ? "border-[#2E7D32] bg-[#2E7D32]/8 ring-1 ring-[#2E7D32]"
          : "border-gray-200 bg-white hover:border-[#2E7D32]/50 hover:bg-gray-50",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={`block font-semibold text-sm ${selected ? "text-[#2E7D32]" : "text-gray-800"}`}
      >
        {label}
      </span>
      {description && (
        <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [service, setService] = useState<ServiceType | null>(null);
  const [sqft, setSqft] = useState<SqftRange | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);

  const selectedService = service ? SERVICES.find((s) => s.id === service) : null;
  const isOneTimeOnly = selectedService?.oneTimeOnly ?? false;

  // Auto-lock frequency to one-time for post-construction
  const effectiveFrequency: Frequency | null = isOneTimeOnly
    ? "one-time"
    : frequency;

  const allSelected = service !== null && sqft !== null && effectiveFrequency !== null;
  const estimate =
    allSelected && service && sqft && effectiveFrequency
      ? calcMonthlyRange(service, sqft, effectiveFrequency)
      : null;

  function handleServiceChange(id: ServiceType) {
    setService(id);
    if (SERVICES.find((s) => s.id === id)?.oneTimeOnly) {
      setFrequency("one-time");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2E7D32] text-white shadow-md">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-200 mb-0.5">
            AG Cleaning Solutions
          </p>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            Instant Quote Calculator
          </h1>
          <p className="mt-1 text-sm text-green-100">
            Get an estimated price range for your facility in seconds.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-6">

          {/* Step 1 – Service Type */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <StepLabel number={1} text="Select a Service" />
            <div className="grid gap-3 sm:grid-cols-3">
              {SERVICES.map((svc) => (
                <OptionCard
                  key={svc.id}
                  id={svc.id}
                  label={svc.label}
                  description={svc.description}
                  selected={service === svc.id}
                  onClick={handleServiceChange}
                />
              ))}
            </div>
          </section>

          {/* Step 2 – Square Footage */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <StepLabel number={2} text="Facility Size" />
            <div className="grid gap-3 sm:grid-cols-2">
              {SQFT_RANGES.map((range) => (
                <OptionCard
                  key={range.id}
                  id={range.id}
                  label={range.label}
                  selected={sqft === range.id}
                  onClick={setSqft}
                />
              ))}
            </div>
          </section>

          {/* Step 3 – Cleaning Frequency */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <StepLabel number={3} text="Cleaning Frequency" />
            {isOneTimeOnly && (
              <p className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                Post-Construction Cleanup is a one-time service.
              </p>
            )}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
              {FREQUENCIES.map((freq) => (
                <OptionCard
                  key={freq.id}
                  id={freq.id}
                  label={freq.label}
                  selected={effectiveFrequency === freq.id}
                  disabled={isOneTimeOnly && freq.id !== "one-time"}
                  onClick={(id) => setFrequency(id)}
                />
              ))}
            </div>
          </section>

          {/* Estimate Output */}
          <section
            className={[
              "rounded-xl border p-5 shadow-sm transition-all duration-300",
              estimate
                ? "border-[#2E7D32] bg-[#2E7D32]"
                : "border-gray-200 bg-white",
            ].join(" ")}
          >
            {estimate ? (
              <div className="text-center text-white">
                <p className="text-sm font-semibold uppercase tracking-widest text-green-200 mb-1">
                  Estimated Monthly Cost
                </p>
                <p className="text-4xl font-bold sm:text-5xl">
                  {formatCurrency(estimate.low)}
                  <span className="text-2xl font-semibold text-green-200 mx-2">
                    –
                  </span>
                  {formatCurrency(estimate.high)}
                </p>
                <p className="mt-2 text-sm text-green-100">
                  {effectiveFrequency === "one-time"
                    ? "One-time service · single visit"
                    : `${estimate.visits} visit${estimate.visits > 1 ? "s" : ""} per month`}
                  {" · "}
                  Based on ~
                  {SQFT_RANGES.find((s) => s.id === sqft)!.repSqft.toLocaleString()}{" "}
                  sq ft
                </p>
                <p className="mt-1 text-xs text-green-200/70">
                  Pricing is an estimate. Final quote based on site assessment.
                </p>

                <a
                  href={GHL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#2E7D32] shadow-md transition-all duration-150 hover:bg-green-50 hover:shadow-lg active:scale-95"
                >
                  Request a Full Quote
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mb-3 flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-40"
                  >
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-500 text-sm">
                  Complete all selections above to see your estimate
                </p>
                <div className="mt-2 flex justify-center gap-2">
                  {[
                    { label: "Service", done: service !== null },
                    { label: "Size", done: sqft !== null },
                    { label: "Frequency", done: effectiveFrequency !== null },
                  ].map(({ label, done }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        done
                          ? "bg-green-100 text-[#2E7D32]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {done ? "✓" : "○"} {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          AG Cleaning Solutions · Commercial Cleaning Specialists ·{" "}
          <a
            href={GHL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2E7D32]"
          >
            Contact Us
          </a>
        </p>
      </main>
    </div>
  );
}
