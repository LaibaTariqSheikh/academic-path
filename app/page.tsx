"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CheckCircle2,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (user?.role === "student") router.push("/student/dashboard");
    else if (user?.role === "guide") router.push("/guide/dashboard");
    else if (user?.role === "admin") router.push("/admin/dashboard");
    else router.push("/auth/login");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-neutral-950 shadow-xl">
              <Brain size={22} />
            </div>
            <div>
              <p className="text-lg font-black tracking-[-0.03em]">
                EduPath
              </p>
              <p className="text-xs text-neutral-400">
                Academic Recommendation & Guidance
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <button
                onClick={goToDashboard}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/guest")}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-white/10"
                >
                  Start as Guest
                </button>

                <button
                  onClick={() => router.push("/auth/login")}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 backdrop-blur">
              <Sparkles size={16} />
              Dual-mode Academic Recommendation Platform
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-[-0.06em] md:text-7xl">
              Smarter Academic Decisions for students
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
              A unified platform where individual students can get instant
              AI-based recommendations, while institutes can manage students,
              guides, analytics, and mentorship.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              {user ? (
                <button
                  onClick={goToDashboard}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-neutral-950 shadow-2xl transition hover:bg-neutral-200"
                >
                  Continue to Dashboard
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/guest")}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-neutral-950 shadow-2xl transition hover:bg-neutral-200"
                  >
                    Start Free as Guest
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    onClick={() => router.push("/auth/signup")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-4xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-3xl bg-neutral-950 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Platform Preview</p>
                  <p className="text-xl font-bold">Guidance Workflow</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Working
                </span>
              </div>

              <div className="space-y-4">
                <PreviewRow
                  icon={<GraduationCap size={20} />}
                  title="Student"
                  text="Questionnaire, AI recommendation, skills, institutes"
                />
                <PreviewRow
                  icon={<Building2 size={20} />}
                  title="Institute"
                  text="Admin control, guide assignment, student monitoring"
                />
                <PreviewRow
                  icon={<MessageSquareText size={20} />}
                  title="Mentorship"
                  text="Guides view recommendations and add comments"
                />
                <PreviewRow
                  icon={<Bell size={20} />}
                  title="Notifications"
                  text="Updates for recommendations, assignments, comments"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/3 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Two Entry Paths
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
              One System, Two Use Cases
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ModeCard
              icon={<GraduationCap size={28} />}
              title="For Individual Students"
              description="Students can use the platform independently without institute approval."
              points={[
                "Start as guest without signup",
                "Create individual student account",
                "Get AI-based recommendation",
                "View skills and institutes",
                "Save recommendation history after login",
              ]}
              primaryLabel="Start as Guest"
              secondaryLabel="Student Signup"
              onPrimary={() => router.push("/guest")}
              onSecondary={() => router.push("/auth/signup")}
            />

            <ModeCard
              icon={<Building2 size={28} />}
              title="For Schools & Institutes"
              description="Institutes can use it as a complete academic guidance management system."
              points={[
                "Admin manages institute users",
                "Admin assigns guides",
                "Guides view student recommendations",
                "Students receive guide support",
                "Analytics and notifications included",
              ]}
              primaryLabel="Institute Signup"
              secondaryLabel="Institute Login"
              onPrimary={() => router.push("/auth/signup")}
              onSecondary={() => router.push("/auth/login")}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
              How it Works?
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em]">
              From Questionnaire to Recommendation to Mentorship.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <StepCard
              number="01"
              title="Student Input"
              text="The student fills a structured questionnaire based on academic performance, interests, and study habits."
            />
            <StepCard
              number="02"
              title="ML Prediction"
              text="The backend sends questionnaire data to the FastAPI ML service, which predicts the suitable academic path."
            />
            <StepCard
              number="03"
              title="Recommendation"
              text="The system displays the recommended field, skills, and relevant schools or colleges."
            />
            <StepCard
              number="04"
              title="Guidance Loop"
              text="In institute mode, admins assign guides and guides add comments for student support."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/3 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            <RoleCard
              icon={<GraduationCap size={24} />}
              title="Student Dashboard"
              text="Recommendations, skills, institutes, assigned guide, and recommendation history."
            />
            <RoleCard
              icon={<Users size={24} />}
              title="Guide Dashboard"
              text="Assigned students, latest recommendation, recommendation history, and comments."
            />
            <RoleCard
              icon={<BarChart3 size={24} />}
              title="Admin Dashboard"
              text="Institute users, guide assignment, analytics, user management, and notifications."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Why it Matters?
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
              AI Alone is not Enough. Guidance Matters!
            </h2>
            <p className="mt-5 leading-8 text-neutral-300">
              Students often choose academic paths without structured support.
              This system combines machine learning recommendations with human
              mentorship so decisions become more informed, organized, and
              practical.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BenefitCard
              icon={<Brain size={22} />}
              title="AI-based prediction"
              text="Uses questionnaire data to predict suitable academic streams."
            />
            <BenefitCard
              icon={<ShieldCheck size={22} />}
              title="Role-based access"
              text="Separate flows for student, guide, admin, guest, and institute users."
            />
            <BenefitCard
              icon={<Bell size={22} />}
              title="Notifications"
              text="Keeps users updated when recommendations, assignments, or comments happen."
            />
            <BenefitCard
              icon={<CheckCircle2 size={22} />}
              title="Recommendation history"
              text="Students and guides can review previous recommendations."
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-4xl border border-white/10 bg-white/6 p-8 text-center shadow-2xl">
          <h2 className="text-4xl font-black tracking-[-0.04em]">
            Ready to try the System?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
            Start as a guest or create an account to save your recommendations, track your history, and access personalized dashboards.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => router.push("/guest")}
              className="rounded-2xl bg-white px-6 py-4 font-bold text-neutral-950 hover:bg-neutral-200"
            >
              Start as Guest
            </button>

            <button
              onClick={() => router.push("/auth/signup")}
              className="rounded-2xl border border-white/15 px-6 py-4 font-bold hover:bg-white/10"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-neutral-500">
        EduPath — Academic Recommendation Platform
        platform.
      </footer>
    </main>
  );
}

function PreviewRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-950">
          {icon}
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-neutral-400">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  description,
  points,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-4xl border border-white/10 bg-white/6 p-7 shadow-2xl"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-neutral-950">
        {icon}
      </div>

      <h3 className="text-3xl font-bold">{title}</h3>
      <p className="mt-4 leading-7 text-neutral-300">{description}</p>

      <ul className="mt-6 space-y-3 text-neutral-300">
        {points.map((point) => (
          <li key={point} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onPrimary}
          className="rounded-xl bg-white px-5 py-3 font-bold text-neutral-950 hover:bg-neutral-200"
        >
          {primaryLabel}
        </button>

        <button
          onClick={onSecondary}
          className="rounded-xl border border-white/15 px-5 py-3 font-bold hover:bg-white/10"
        >
          {secondaryLabel}
        </button>
      </div>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <p className="text-sm font-black text-neutral-500">{number}</p>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{text}</p>
    </motion.div>
  );
}

function RoleCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-xl"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-950">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{text}</p>
    </motion.div>
  );
}

function BenefitCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-950">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{text}</p>
    </div>
  );
}