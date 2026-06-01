"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const SAMPLE_STUDENT = {
  name: "Alex Rivera",
  year: "Sophomore",
  major: "Computer Science",
  gpa: "3.4",
  goal: "Land a data analytics internship at a tech or fintech company",
  targetIndustries: ["tech", "finance"],
  locationPreference: "any",
  experienceLevel: "entry",
  skills: ["Python (basic)", "SQL (intro course)", "Excel", "Statistics 101"],
  resume: `Alex Rivera
Computer Science, Sophomore — State University

EDUCATION
B.S. Computer Science, State University (expected May 2027)
GPA: 3.4 | Relevant coursework: Intro to Python, Database Systems, Statistics I

EXPERIENCE
Campus IT Help Desk — Student Technician (Sep 2024 – present)
- Assisted students and faculty with hardware/software issues
- Maintained ticket log in Jira

PROJECTS
Movie Recommendation Script (Fall 2024)
- Built a Python script that reads a CSV of Letterboxd ratings and suggests films
  using simple cosine similarity; used pandas and sklearn basics

Campus Dining Survey Analysis (Spring 2025)
- Collected 120 survey responses and visualized results in Excel pivot tables
  for a Sociology class project

SKILLS
Python (pandas, basics), SQL (SELECT/JOIN level), Excel, Git (beginner)

ACTIVITIES
- Data Science Club (member, Fall 2024 – present)
- Intramural soccer`,
};

const CATEGORY_COLORS = {
  Skills: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Projects: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Experience: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Network: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Credentials: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ScoreBar({ score }) {
  const color =
    score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-slate-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${
        score >= 70 ? "text-emerald-400" : score >= 45 ? "text-amber-400" : "text-slate-400"
      }`}>
        {score}
      </span>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const isSample = searchParams.get("sample") === "true";
  const student = isSample ? SAMPLE_STUDENT : null;

  const [matches, setMatches] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!student) return;

    setMatchLoading(true);
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parsedResume: student.resume,
        careerGoal: student.goal,
        targetIndustries: student.targetIndustries,
        locationPreference: student.locationPreference,
        experienceLevel: student.experienceLevel,
      }),
    })
      .then((r) => r.json())
      .then((data) => setMatches(data.results))
      .catch(() =>
        setMatches(null)
      )
      .finally(() => setMatchLoading(false));

    setPlanLoading(true);
    fetch("/api/action-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parsedResume: student.resume,
        careerGoal: student.goal,
      }),
    })
      .then((r) => r.json())
      .then((data) => setPlan(data))
      .catch(() => setPlan(null))
      .finally(() => setPlanLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSample]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500">Upload your resume to get started.</p>
        </div>
      </div>
    );
  }

  const displayRoles = matches ?? [];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-slate-800">
        <span className="text-white font-bold text-xl tracking-tight">Nextern</span>
        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium px-3 py-1 rounded-full">
          Sample profile loaded
        </span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left col */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Profile card */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {student.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-white font-semibold">{student.name}</div>
                <div className="text-slate-400 text-sm">{student.year} · {student.major}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Goal</div>
                <div className="text-slate-200">{student.goal}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">GPA</div>
                <div className="text-slate-200">{student.gpa}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Skills on resume</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {student.skills.map((s) => (
                    <span key={s} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action plan */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white font-semibold text-sm">Action Plan</span>
              {planLoading && (
                <span className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              )}
            </div>

            {planLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-700/40 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!planLoading && plan && (
              <>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{plan.summary}</p>
                <ul className="space-y-3">
                  {plan.actions.map((action, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-0.5 w-4 h-4 rounded border border-slate-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[action.category] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                            {action.category}
                          </span>
                        </div>
                        <div className="text-slate-200 text-sm font-medium">{action.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{action.why}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {!planLoading && !plan && (
              <p className="text-slate-500 text-xs">Could not load action plan.</p>
            )}
          </div>

          {/* Raw resume */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-3">Resume (raw)</div>
            <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{student.resume}</pre>
          </div>
        </aside>

        {/* Right col — internship cards */}
        <main className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold text-lg">
              {matchLoading ? "Scoring internships…" : `${displayRoles.length} internships scored`}
            </h2>
            {matchLoading && (
              <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            )}
          </div>

          {/* Loading skeletons */}
          {matchLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-slate-700 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {!matchLoading && displayRoles.map((role) => (
            <div key={role.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-white font-semibold text-base">{role.role}</div>
                  <div className="text-emerald-400 text-sm font-medium">{role.company}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    role.location === "remote"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-700 text-slate-300 border border-slate-600"
                  }`}>
                    {role.location === "remote" ? "Remote" : role.location}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">{role.sector}</span>
                </div>
              </div>

              {/* Fit score */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-xs">Fit score</span>
                </div>
                <ScoreBar score={role.score} />
                {role.explanation && (
                  <p className="text-slate-400 text-xs mt-1.5 italic">{role.explanation}</p>
                )}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">{role.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {role.requirements.map((req) => (
                  <span key={req} className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-600">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {!matchLoading && displayRoles.length === 0 && (
            <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
              <p className="text-slate-400">No matching internships found.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
