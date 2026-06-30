"use client";

import { useRouter } from "next/navigation";

export default function GuestStartPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-12 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            EduPath Guest Access
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Explore Your Academic Path — No Account Required
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-600">
            Try EduPath instantly without creating an account. Select your academic level, complete a short questionnaire, and receive personalized Academic recommendations.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <button
              onClick={() => router.push("/guest/questionnaire?level=grade8")}
              className="rounded-2xl border border-neutral-300 bg-neutral-50 p-6 text-left transition hover:border-black hover:bg-white hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold">Grade 8 Student</h2>
              <p className="mt-2 text-neutral-600">
                Discover the most suitable secondary education pathway based on your interests and academic performance.
              </p>
            </button>

            <button
              onClick={() =>
                router.push("/guest/questionnaire?level=olevel-matric")
              }
              className="rounded-2xl border border-neutral-300 bg-neutral-50 p-6 text-left transition hover:border-black hover:bg-white hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold">O-Level / Matric</h2>
              <p className="mt-2 text-neutral-600">
                Receive recommendations for selecting the most suitable college-level academic stream.
              </p>
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-lg border border-neutral-300 px-5 py-3 text-neutral-800 hover:bg-neutral-100"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}