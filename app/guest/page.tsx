"use client";

import { useRouter } from "next/navigation";

export default function GuestStartPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-12 text-neutral-900">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Guest Mode
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Get an Academic Recommendation Without Signup
          </h1>

          <p className="mt-4 max-w-2xl text-neutral-600">
            Use the system as an individual student without institute approval.
            Choose your level and fill the questionnaire to receive an instant
            AI-based recommendation.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <button
              onClick={() => router.push("/guest/questionnaire?level=grade8")}
              className="rounded-2xl border border-neutral-300 bg-neutral-50 p-6 text-left transition hover:border-black hover:bg-white hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold">Grade 8 Student</h2>
              <p className="mt-2 text-neutral-600">
                Get guidance for school-level academic stream selection.
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
                Get guidance for college-level academic path selection.
              </p>
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 rounded-lg border border-neutral-300 px-5 py-3 text-neutral-800 hover:bg-neutral-100"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}