import { Brain, GraduationCap, ShieldCheck } from "lucide-react";

export default function SiteFooter() {
  const linkClass =
    "font-bold text-white transition duration-300 hover:text-[#e5e5e5] hover:underline";

  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300 dark:border-neutral-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950">
              <GraduationCap size={18} />
            </span>

            <h3 className="text-xl font-bold text-white">EduPath</h3>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">
            EduPath is an AI-powered academic recommendation platform developed
            to help students make informed educational decisions while enabling
            institutes to manage academic guidance through role-based dashboards,
            mentorship, and intelligent recommendations.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white">
            Platform Features
          </h4>

          <div className="mt-4 space-y-3 text-sm text-neutral-400">
            <div className="flex items-center gap-3">
              <Brain size={16} />
              AI-powered academic recommendations
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={16} />
              Student, Guide & Admin dashboards
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap size={16} />
              Institute management & career guidance
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white">About EduPath</h4>

          <ul className="mt-4 space-y-2 text-sm leading-7 text-neutral-400">
            <li>AI-based academic path prediction</li>
            <li>Questionnaire-driven recommendations</li>
            <li>Recommendation history & notifications</li>
            <li>Guide assignment and mentor feedback</li>
            <li>Designed for Pakistani educational institutes</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-6 py-5 text-center text-sm text-neutral-500">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">EduPath</span>. Developed
          by{" "}
          <a
            href="https://www.linkedin.com/in/laiba-tariq-"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Laiba Tariq
          </a>
          {", "}
          <a
            href="https://linkedin.com/in/urooj-asim-1b1a33200"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Urooj Asim
          </a>
          {" and "}
          <a
            href="https://www.linkedin.com/in/huzaifa-yousuf-b333b9235"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            M. Huzaifa
          </a>
        </p>
      </div>
    </footer>
  );
}