import { Brain, GraduationCap, ShieldCheck } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300 dark:border-neutral-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950">
              <GraduationCap size={18} />
            </span>
            <h3 className="text-lg font-bold text-white">AI Academic Path</h3>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">
            A premium academic decision-support platform that blends elegant user
            experience with machine learning, role-based dashboards, and
            institute-level workflows.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Core System</h4>
          <div className="mt-4 space-y-3 text-sm text-neutral-400">
            <div className="flex items-center gap-3">
              <Brain size={16} />
              AI-based recommendation engine
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} />
              Admin, Guide, Student dashboards
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap size={16} />
              School and college recommendation support
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Project Scope</h4>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-neutral-400">
            <li>Questionnaire-based academic guidance</li>
            <li>Guide assignment and mentor feedback</li>
            <li>Institute-specific role management</li>
            <li>Premium presentation-ready product design</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-6 py-4 text-center text-sm text-neutral-500">
        © 2026 AI Academic Path · Final Year Project
      </div>
    </footer>
  );
}