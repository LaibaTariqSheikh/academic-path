"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { apiUrl } from "@/lib/api";

type FormDataType = {
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

export default function QuestionnairePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormDataType>({
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

  const [prediction, setPrediction] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSkills = (field: string) => {
    const map: Record<string, string[]> = {
      "Science Stream": ["Analytical Thinking", "Problem Solving", "Observation", "Scientific Curiosity"],
      "Commerce Stream": ["Numerical Skills", "Communication", "Business Thinking", "Decision Making"],
      "Arts Stream": ["Creativity", "Writing", "Expression", "Critical Thinking"],
      "Computer Science": ["Logic Building", "Technology Use", "Problem Solving", "Digital Literacy"],
      "General Path": ["Self Awareness", "Research", "Adaptability", "Confidence"],
    };

    return map[field] || ["Communication", "Confidence", "Learning Ability", "Adaptability"];
  };

  const getInstitutes = (field: string) => {
    const normalizedField = field.trim();

    const cityMap: Record<string, string[]> = {
      "Science Stream": ["Beaconhouse School System", "The City School", "Karachi Grammar School"],
      "Commerce Stream": ["The City School", "Beaconhouse School System", "Foundation Public School"],
      "Arts Stream": ["Beaconhouse School System", "The City School", "Happy Home School"],
      "Computer Science": ["Beaconhouse School System", "The City School", "Karachi Grammar School"],
      "General Path": ["The City School", "Beaconhouse School System", "Foundation Public School"],
    };

    const countryMap: Record<string, string[]> = {
      "Science Stream": ["Lahore Grammar School", "Roots International Schools", "Beaconhouse School System"],
      "Commerce Stream": ["Roots Millennium Schools", "The City School", "Beaconhouse School System"],
      "Arts Stream": ["Lahore Grammar School", "Roots International Schools", "Beaconhouse School System"],
      "Computer Science": ["Lahore Grammar School", "Roots International Schools", "Beaconhouse School System"],
      "General Path": ["Roots Millennium Schools", "The City School", "Beaconhouse School System"],
    };

    return {
      cityInstitutes: cityMap[normalizedField] || ["No mapped school yet"],
      countryInstitutes: countryMap[normalizedField] || ["No mapped school yet"],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction("");

    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const response = await fetch(apiUrl("/api/questionnaire/q1"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          user_id: parsedUser?.id || null,
        }),
      });

      const rawText = await response.text();

      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        showToast("Submission failed", "Backend returned invalid response.", "error");
        throw new Error(`Backend returned non-JSON response: ${rawText}`);
      }

      if (!response.ok) {
        showToast("Submission failed", data.error || "Unable to generate your recommendation.", "error");
        throw new Error(data.error || "Failed to get prediction");
      }

      const field = data.prediction;
      setPrediction(field);

      const institutes = getInstitutes(field);
      const skills = getSkills(field);

      if (parsedUser?.id) {
        localStorage.setItem(
          `latestRecommendation_${parsedUser.id}`,
          JSON.stringify({
            field,
            skills,
            cityInstitutes: institutes.cityInstitutes,
            countryInstitutes: institutes.countryInstitutes,
          })
        );
      }

    showToast(
       "Assessment Complete",
       "Your BeGuided recommendation has been generated successfully.",
       "success"
    );

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
      console.error("Frontend submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-900"> Grade 8 Academic Assessment </h1>
        <p className="mb-8 text-gray-600">
          Complete this assessment to receive a personalized academic recommendation from BeGuided.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Academic Performance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Overall academic performance last year</label>
                <select name="academic_performance" value={formData.academic_performance} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Below 50%">Below 50%</option>
                  <option value="50–60%">50–60%</option>
                  <option value="61–75%">61–75%</option>
                  <option value="Above 75%">Above 75%</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Mathematics</label>
                <select name="math_level" value={formData.math_level} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Weak">Weak</option>
                  <option value="Average">Average</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Science</label>
                <select name="science_level" value={formData.science_level} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Weak">Weak</option>
                  <option value="Average">Average</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">English</label>
                <select name="english_level" value={formData.english_level} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Weak">Weak</option>
                  <option value="Average">Average</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Interests & Hobbies</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Free time activities</label>
                <select name="interest_type" value={formData.interest_type} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Logical games">Logical games</option>
                  <option value="Technology">Technology use</option>
                  <option value="Reading/writing">Reading/writing</option>
                  <option value="Creative work">Creative work</option>
                  <option value="Leadership activities">Leadership activities</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Study Habits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Homework completion</label>
                <select name="study_consistency" value={formData.study_consistency} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Almost always">Almost always</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="Rarely">Rarely</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">When topic is difficult</label>
                <select name="problem_solving" value={formData.problem_solving} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Keep trying">Keep trying</option>
                  <option value="Ask for help">Ask for help</option>
                  <option value="Avoid it">Avoid it</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Focus time</label>
                <select name="focus_time" value={formData.focus_time} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="<30 minutes">&lt;30 minutes</option>
                  <option value="30–60 minutes">30–60 minutes</option>
                  <option value=">1 hour">&gt;1 hour</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Learning Style & Environment</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Preferred learning method</label>
                <select name="learning_style" value={formData.learning_style} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Reading">Reading</option>
                  <option value="Visual">Visual</option>
                  <option value="Hands-on">Hands-on</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Comfortable studying in English</label>
                <select name="english_comfort" value={formData.english_comfort} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="Somewhat">Somewhat</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Computer use for learning</label>
                <select name="computer_usage" value={formData.computer_usage} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Regularly">Regularly</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Rarely">Rarely</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Financial readiness</label>
                <select name="financial_status" value={formData.financial_status} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Can afford tuition">Can afford tuition</option>
                  <option value="Limited budget">Limited budget</option>
                  <option value="Prefer government system">Prefer government system</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Generating your Recommendation..." : "Generate Recommendation"}
            </button>

            <button type="button" onClick={() => router.push("/student/dashboard")} className="rounded-lg border border-gray-300 px-4 py-3 text-gray-800 hover:bg-gray-100">
              Back to Dashboard
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {prediction && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
            <h2 className="mb-2 text-2xl font-bold text-green-800">Your Recommended Academic Path</h2>
            <p className="text-lg text-green-700">{prediction}</p>

            <button
             type="button"
              onClick={() => router.replace("/student/dashboard")}
              className="mt-4 rounded-lg bg-green-700 px-4 py-3 text-white hover:opacity-90"
                                 >
             View Recommendation Dashboard
             </button>
          </div>
        )}
      </div>
    </main>
  );
}