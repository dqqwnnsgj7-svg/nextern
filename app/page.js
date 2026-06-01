import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-slate-800">
        <span className="text-white font-bold text-xl tracking-tight">
          Nextern
        </span>
        <span className="text-slate-400 text-sm">AI Internship Matcher</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Powered by Claude AI</span>
        </div>

        <h1 className="text-5xl font-bold text-white leading-tight max-w-3xl mb-6">
          Find internships that{" "}
          <span className="text-emerald-400">actually fit</span> your profile
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-12">
          Upload your resume, share your career goals, and get AI-scored matches
          with a personalized action plan — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/onboarding"
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
          >
            Get started
          </Link>
          <Link
            href="/dashboard?sample=true"
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg border border-slate-700"
          >
            Load sample student →
          </Link>
        </div>

        {/* Feature strip */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            { icon: "📄", title: "Resume parsing", desc: "Claude reads your PDF and extracts skills, projects, and experience automatically." },
            { icon: "🎯", title: "Smart matching", desc: "Each internship gets a 0–100 fit score with a plain-English reason why." },
            { icon: "🗺️", title: "Action plan", desc: "Get a concrete checklist of clubs, certs, and projects to close the gap." },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="text-white font-semibold mb-1">{f.title}</div>
              <div className="text-slate-400 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
