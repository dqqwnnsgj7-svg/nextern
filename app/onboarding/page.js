"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = ["About you", "Career goal", "Industries & location", "Availability"];

const INDUSTRY_OPTIONS = [
  { id: "tech", label: "Tech / Software" },
  { id: "finance", label: "Finance / Fintech" },
  { id: "marketing", label: "Marketing / Growth" },
  { id: "design", label: "Design / UX" },
  { id: "data", label: "Data / Analytics" },
  { id: "healthcare", label: "Healthcare / Biotech" },
  { id: "consulting", label: "Consulting" },
  { id: "media", label: "Media / Entertainment" },
];

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const EXPERIENCE_OPTIONS = [
  { id: "no-experience", label: "No experience yet" },
  { id: "entry", label: "Some coursework / projects" },
  { id: "some", label: "1–2 past internships" },
];

const AVAILABILITY_OPTIONS = [
  { id: "summer", label: "Summer 2025", sub: "Full-time, May–Aug" },
  { id: "part-time", label: "Part-time", sub: "During the school year" },
  { id: "flexible", label: "Flexible", sub: "Open to anything" },
  { id: "custom", label: "Custom dates", sub: "I'll specify" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i < current
                ? "bg-emerald-500 text-white"
                : i === current
                ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                : "bg-slate-700 text-slate-400"
            }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs mt-1.5 hidden sm:block ${i === current ? "text-white" : "text-slate-500"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-12 sm:w-20 mx-1 mb-5 transition-colors ${i < current ? "bg-emerald-500" : "bg-slate-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ChipButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
        selected
          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form state
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [goal, setGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [targetIndustries, setTargetIndustries] = useState([]);
  const [locationPreference, setLocationPreference] = useState("any");
  const [remoteOk, setRemoteOk] = useState(true);
  const [availability, setAvailability] = useState("summer");
  const [availStart, setAvailStart] = useState("");
  const [availEnd, setAvailEnd] = useState("");

  function toggleIndustry(id) {
    setTargetIndustries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function canAdvance() {
    if (step === 0) return name.trim() && year && major.trim();
    if (step === 1) return goal.trim().length >= 10;
    if (step === 2) return targetIndustries.length > 0;
    return true;
  }

  function buildResumeText() {
    const lines = [`${name}`, `${year} — ${major}`, ""];
    lines.push("CAREER GOAL");
    lines.push(goal, "");
    if (targetIndustries.length) {
      lines.push("TARGET INDUSTRIES");
      lines.push(targetIndustries.join(", "), "");
    }
    lines.push("AVAILABILITY");
    if (availability === "custom") {
      lines.push(`${availStart || "TBD"} to ${availEnd || "TBD"}`);
    } else {
      const opt = AVAILABILITY_OPTIONS.find((o) => o.id === availability);
      lines.push(opt ? `${opt.label} (${opt.sub})` : availability);
    }
    return lines.join("\n");
  }

  function handleSubmit() {
    const profile = {
      name: name.trim(),
      year,
      major: major.trim(),
      goal: goal.trim(),
      targetIndustries,
      locationPreference: remoteOk && locationPreference === "any" ? "any" : locationPreference,
      remoteOk,
      experienceLevel,
      availability,
      availabilityStart: availStart || null,
      availabilityEnd: availEnd || null,
      skills: [],
      resume: buildResumeText(),
    };

    try {
      sessionStorage.setItem("nextern_profile", JSON.stringify(profile));
    } catch {
      // sessionStorage unavailable — profile passes via URL is not feasible for long text,
      // dashboard will show a graceful empty state
    }
    router.push("/dashboard?from=onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <nav className="px-8 py-5 flex items-center border-b border-slate-800">
        <span className="text-white font-bold text-xl tracking-tight">Nextern</span>
      </nav>

      <main className="flex-1 flex items-start justify-center px-6 py-14">
        <div className="w-full max-w-lg">
          <StepIndicator current={step} />

          {/* Step 0 — About you */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Let's get to know you</h2>
                <p className="text-slate-400 text-sm">Just the basics — takes 30 seconds.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Year</label>
                  <div className="flex flex-wrap gap-2">
                    {YEAR_OPTIONS.map((y) => (
                      <ChipButton key={y} selected={year === y} onClick={() => setYear(y)}>{y}</ChipButton>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Major / field of study</label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Career goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">What's your career goal?</h2>
                <p className="text-slate-400 text-sm">Be specific — Claude uses this to score your fit.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Career goal</label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={4}
                    placeholder="e.g. Land a data analytics internship at a tech company where I can use Python and SQL to build dashboards and influence product decisions."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <div className="text-slate-600 text-xs mt-1 text-right">{goal.length} chars</div>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Experience level</label>
                  <div className="space-y-2">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExperienceLevel(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                          experienceLevel === opt.id
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Industries & location */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Industries & location</h2>
                <p className="text-slate-400 text-sm">Pick at least one industry.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Target industries</label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <ChipButton
                        key={ind.id}
                        selected={targetIndustries.includes(ind.id)}
                        onClick={() => toggleIndustry(ind.id)}
                      >
                        {ind.label}
                      </ChipButton>
                    ))}
                  </div>
                  {targetIndustries.length === 0 && (
                    <p className="text-slate-500 text-xs mt-2">Select at least one to continue.</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Location preference</label>
                  <div className="space-y-2">
                    {[
                      { id: "any", label: "Anywhere — open to all locations" },
                      { id: "remote", label: "Remote only" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLocationPreference(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                          locationPreference === opt.id
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setRemoteOk((v) => !v)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${remoteOk ? "bg-emerald-500" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${remoteOk ? "left-5" : "left-1"}`} />
                  </div>
                  <span className="text-slate-300 text-sm">Remote-friendly roles are OK</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3 — Availability + resume placeholder */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">When are you available?</h2>
                <p className="text-slate-400 text-sm">This helps filter roles by timeline.</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvailability(opt.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors ${
                        availability === opt.id
                          ? "bg-emerald-500/10 border-emerald-500/50"
                          : "bg-slate-800 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className={`font-medium text-sm ${availability === opt.id ? "text-emerald-400" : "text-slate-200"}`}>
                        {opt.label}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>

                {availability === "custom" && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs mb-1">Start date</label>
                      <input
                        type="date"
                        value={availStart}
                        onChange={(e) => setAvailStart(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-slate-400 text-xs mb-1">End date</label>
                      <input
                        type="date"
                        value={availEnd}
                        onChange={(e) => setAvailEnd(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Resume placeholder */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Resume</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-800/40">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-slate-400 text-sm font-medium">PDF upload coming in Step 5</p>
                    <p className="text-slate-600 text-xs mt-1">For now, Claude will score based on your answers above.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  canAdvance()
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
              >
                Find my matches
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
