"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { apiUrl } from "@/lib/api";

type Q1Data = {
  academic_performance: string;
  math_level: string;
  science_level: string;
  english_level: string;
  interest_type: string;
  study_consistency: string;
  problem_solving: string;
  focus_time: string;
  learning_style: string;
  english_comfort: string;
  computer_usage: string;
  financial_status: string;
};

type Q2Data = {
  previous_system: string;
  previous_stream: string;
  academic_performance: string;
  strong_subject: string;
  weak_area: string;
  interest_area: string;
  study_independence: string;
  study_hours: string;
  analytical_skill: string;
  problem_handling: string;
  tuition_access: string;
  study_preference: string;
  career_clarity: string;
  decision_factor: string;
  confidence_level: string;
};

type RecommendationData = {
  field: string;
  skills: string[];
  cityInstitutes: string[];
  countryInstitutes: string[];
};

const pakistanCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Hyderabad",
  "Sukkur",
  "Shikarpur",
  "Multan",
  "Faisalabad",
  "Peshawar",
  "Quetta",
];

function GuestQuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const level = searchParams.get("level") || "grade8";
  const isGrade8 = level === "grade8";

  const [guestCity, setGuestCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] =
    useState<RecommendationData | null>(null);

  const [q1, setQ1] = useState<Q1Data>({
    academic_performance: "",
    math_level: "",
    science_level: "",
    english_level: "",
    interest_type: "",
    study_consistency: "",
    problem_solving: "",
    focus_time: "",
    learning_style: "",
    english_comfort: "",
    computer_usage: "",
    financial_status: "",
  });

  const [q2, setQ2] = useState<Q2Data>({
    previous_system: "",
    previous_stream: "",
    academic_performance: "",
    strong_subject: "",
    weak_area: "",
    interest_area: "",
    study_independence: "",
    study_hours: "",
    analytical_skill: "",
    problem_handling: "",
    tuition_access: "",
    study_preference: "",
    career_clarity: "",
    decision_factor: "",
    confidence_level: "",
  });

  const handleQ1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQ1((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQ2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQ2((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setRecommendation(null);
    setGuestCity("");

    setQ1({
      academic_performance: "",
      math_level: "",
      science_level: "",
      english_level: "",
      interest_type: "",
      study_consistency: "",
      problem_solving: "",
      focus_time: "",
      learning_style: "",
      english_comfort: "",
      computer_usage: "",
      financial_status: "",
    });

    setQ2({
      previous_system: "",
      previous_stream: "",
      academic_performance: "",
      strong_subject: "",
      weak_area: "",
      interest_area: "",
      study_independence: "",
      study_hours: "",
      analytical_skill: "",
      problem_handling: "",
      tuition_access: "",
      study_preference: "",
      career_clarity: "",
      decision_factor: "",
      confidence_level: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestCity) {
      showToast("City required", "Please select your city in Pakistan.", "error");
      return;
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const endpoint = isGrade8
    ? apiUrl("/api/questionnaire/q1")
    : apiUrl("/api/questionnaire/q2");

      const payload = isGrade8 ? q1 : q2;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          user_id: null,
          city: guestCity,
        }),
      });

      const rawText = await response.text();

      let data: {
        prediction?: string;
        error?: string;
        recommendation?: RecommendationData;
      } = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Backend returned invalid response");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recommendation");
      }

      if (!data.recommendation) {
        throw new Error("Recommendation data missing from backend response");
      }

      setRecommendation(data.recommendation);

      sessionStorage.setItem(
        "guestRecommendation",
        JSON.stringify(data.recommendation)
      );

      showToast(
        "Recommendation generated",
        "Your guest recommendation is ready.",
        "success"
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Guest questionnaire error:", error);
      showToast(
        "Submission failed",
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (recommendation) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Guest Result
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Your Academic Recommendation
            </h1>

            <p className="mt-3 text-neutral-600">
              Based on your questionnaire and selected city:{" "}
              <strong>{guestCity}</strong>
            </p>

            <div className="mt-8 rounded-3xl border border-neutral-300 bg-neutral-50 p-6">
              <p className="text-sm font-semibold text-neutral-500">
                Recommended Path
              </p>
              <h2 className="mt-2 text-4xl font-black">
                {recommendation.field}
              </h2>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold">Suggested Skills</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {recommendation.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-6">
                <h3 className="text-2xl font-bold">
                  Suggested Institutes in {guestCity}
                </h3>

                <div className="mt-4 space-y-3">
                  {recommendation.cityInstitutes.map((item, index) => (
                    <div key={index} className="rounded-xl bg-white p-4 shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-300 bg-neutral-50 p-6">
                <h3 className="text-2xl font-bold">
                  Suggested Institutes in Pakistan
                </h3>

                <div className="mt-4 space-y-3">
                  {recommendation.countryInstitutes.map((item, index) => (
                    <div key={index} className="rounded-xl bg-white p-4 shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-6">
              <h3 className="text-xl font-bold">Want to save your result?</h3>
              <p className="mt-2 text-neutral-600">
                Create an individual student account to save your recommendation
                history and access your dashboard.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
                >
                  Create Account
                </button>

                <button
                  onClick={resetForm}
                  className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold hover:bg-white"
                >
                  Fill Questionnaire Again
                </button>

                <button
                  onClick={() => router.push("/guest")}
                  className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold hover:bg-white"
                >
                  Change Level
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Guest Questionnaire
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {isGrade8
              ? "Grade 8 Academic Recommendation"
              : "O-Level / Matric Academic Recommendation"}
          </h1>

          <p className="mt-3 text-neutral-600">
            Fill the questionnaire to receive an instant AI-based recommendation.
            Guest results are not permanently saved.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Location Preference
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-neutral-700">
                    Select your city in Pakistan
                  </label>
                  <select
                    value={guestCity}
                    onChange={(e) => setGuestCity(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
                    required
                  >
                    <option value="">Select city</option>
                    {pakistanCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {isGrade8 ? (
              <>
                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Academic Performance
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Overall academic performance"
                      name="academic_performance"
                      value={q1.academic_performance}
                      onChange={handleQ1Change}
                      options={["Below 50%", "50–60%", "61–75%", "Above 75%"]}
                    />
                    <SelectBox
                      label="Mathematics"
                      name="math_level"
                      value={q1.math_level}
                      onChange={handleQ1Change}
                      options={["Weak", "Average", "Strong"]}
                    />
                    <SelectBox
                      label="Science"
                      name="science_level"
                      value={q1.science_level}
                      onChange={handleQ1Change}
                      options={["Weak", "Average", "Strong"]}
                    />
                    <SelectBox
                      label="English"
                      name="english_level"
                      value={q1.english_level}
                      onChange={handleQ1Change}
                      options={["Weak", "Average", "Strong"]}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Interests & Study Habits
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Free time activities"
                      name="interest_type"
                      value={q1.interest_type}
                      onChange={handleQ1Change}
                      options={[
                        "Logical games",
                        "Technology",
                        "Reading/writing",
                        "Creative work",
                        "Leadership activities",
                      ]}
                    />
                    <SelectBox
                      label="Homework completion"
                      name="study_consistency"
                      value={q1.study_consistency}
                      onChange={handleQ1Change}
                      options={["Almost always", "Sometimes", "Rarely"]}
                    />
                    <SelectBox
                      label="When topic is difficult"
                      name="problem_solving"
                      value={q1.problem_solving}
                      onChange={handleQ1Change}
                      options={["Keep trying", "Ask for help", "Avoid it"]}
                    />
                    <SelectBox
                      label="Focus time"
                      name="focus_time"
                      value={q1.focus_time}
                      onChange={handleQ1Change}
                      options={["<30 minutes", "30–60 minutes", ">1 hour"]}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Learning Environment
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Preferred learning method"
                      name="learning_style"
                      value={q1.learning_style}
                      onChange={handleQ1Change}
                      options={["Reading", "Visual", "Hands-on"]}
                    />
                    <SelectBox
                      label="Comfortable studying in English"
                      name="english_comfort"
                      value={q1.english_comfort}
                      onChange={handleQ1Change}
                      options={["Yes", "Somewhat", "No"]}
                    />
                    <SelectBox
                      label="Computer use for learning"
                      name="computer_usage"
                      value={q1.computer_usage}
                      onChange={handleQ1Change}
                      options={["Regularly", "Occasionally", "Rarely"]}
                    />
                    <SelectBox
                      label="Financial readiness"
                      name="financial_status"
                      value={q1.financial_status}
                      onChange={handleQ1Change}
                      options={[
                        "Can afford tuition",
                        "Limited budget",
                        "Prefer government system",
                      ]}
                    />
                  </div>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Academic Background
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Education system"
                      name="previous_system"
                      value={q2.previous_system}
                      onChange={handleQ2Change}
                      options={["O-Level", "Matric"]}
                    />
                    <SelectBox
                      label="Previous stream"
                      name="previous_stream"
                      value={q2.previous_stream}
                      onChange={handleQ2Change}
                      options={[
                        "Pre-Medical",
                        "Pre-Engineering",
                        "Commerce",
                        "Humanities / Arts",
                        "Other",
                      ]}
                    />
                    <SelectBox
                      label="Academic performance"
                      name="academic_performance"
                      value={q2.academic_performance}
                      onChange={handleQ2Change}
                      options={["Below Average", "Average", "Good", "Excellent"]}
                    />
                    <SelectBox
                      label="Strong subject"
                      name="strong_subject"
                      value={q2.strong_subject}
                      onChange={handleQ2Change}
                      options={["Math", "Physics", "Biology", "Commerce", "Arts"]}
                    />
                    <SelectBox
                      label="Weak area"
                      name="weak_area"
                      value={q2.weak_area}
                      onChange={handleQ2Change}
                      options={["Math", "Science", "Writing", "Memorization"]}
                    />
                    <SelectBox
                      label="Interest area"
                      name="interest_area"
                      value={q2.interest_area}
                      onChange={handleQ2Change}
                      options={["Problem solving", "Research", "Business", "Creative"]}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Study Style & Decision Making
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Study independence"
                      name="study_independence"
                      value={q2.study_independence}
                      onChange={handleQ2Change}
                      options={["Yes", "Somewhat", "No"]}
                    />
                    <SelectBox
                      label="Study hours"
                      name="study_hours"
                      value={q2.study_hours}
                      onChange={handleQ2Change}
                      options={["Yes", "Sometimes", "No"]}
                    />
                    <SelectBox
                      label="Analytical skill"
                      name="analytical_skill"
                      value={q2.analytical_skill}
                      onChange={handleQ2Change}
                      options={[
                        "Strongly Agree",
                        "Agree",
                        "Neutral",
                        "Disagree",
                        "Strongly Disagree",
                      ]}
                    />
                    <SelectBox
                      label="Problem handling"
                      name="problem_handling"
                      value={q2.problem_handling}
                      onChange={handleQ2Change}
                      options={["Keep Trying", "Ask Help", "Avoid"]}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Environment & Career Direction
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectBox
                      label="Tuition access"
                      name="tuition_access"
                      value={q2.tuition_access}
                      onChange={handleQ2Change}
                      options={["Yes", "Limited", "No"]}
                    />
                    <SelectBox
                      label="Study preference"
                      name="study_preference"
                      value={q2.study_preference}
                      onChange={handleQ2Change}
                      options={["Continuous", "Exams"]}
                    />
                    <SelectBox
                      label="Career clarity"
                      name="career_clarity"
                      value={q2.career_clarity}
                      onChange={handleQ2Change}
                      options={["Clear", "Somewhat clear", "Not clear"]}
                    />
                    <SelectBox
                      label="Decision factor"
                      name="decision_factor"
                      value={q2.decision_factor}
                      onChange={handleQ2Change}
                      options={["Interest", "Career", "Family", "Peer"]}
                    />
                    <SelectBox
                      label="Confidence level"
                      name="confidence_level"
                      value={q2.confidence_level}
                      onChange={handleQ2Change}
                      options={["Confident", "Unsure", "Not confident"]}
                    />
                  </div>
                </section>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Recommendation"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/guest")}
                className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold hover:bg-neutral-100"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function SelectBox({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block font-medium text-neutral-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
        required
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
export default function GuestQuestionnairePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading questionnaire...</div>}>
      <GuestQuestionnaireContent />
    </Suspense>
  );
}