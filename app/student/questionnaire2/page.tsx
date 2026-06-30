"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { apiUrl } from "@/lib/api";

type FormDataType = {
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

export default function Questionnaire2Page() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormDataType>({
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

  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSkills = (field: string) => {
    const map: Record<string, string[]> = {
      "Pre-Engineering": ["Mathematics", "Physics", "Problem Solving", "Analytical Thinking"],
      Engineering: ["Mathematics", "Physics", "Problem Solving", "Analytical Thinking"],
      "Pre-Medical": ["Biology", "Research", "Attention to Detail", "Discipline"],
      Medical: ["Biology", "Research", "Attention to Detail", "Discipline"],
      Commerce: ["Accounting", "Business Communication", "Finance Basics", "Numerical Skills"],
      Humanities: ["Writing", "Reading", "Analysis", "Expression"],
      "Humanities / Arts": ["Writing", "Reading", "Analysis", "Expression"],
      Arts: ["Creativity", "Writing", "Critical Thinking", "Presentation"],
    };

    return map[field] || ["Communication", "Confidence", "Adaptability", "Learning Ability"];
  };

  const getInstitutes = (field: string) => {
    const normalizedField = field.trim();

    const cityMap: Record<string, string[]> = {
      "Pre-Engineering": ["Adamjee Government Science College", "DJ Science College", "Bahria College Karachi"],
      Engineering: ["Adamjee Government Science College", "DJ Science College", "Bahria College Karachi"],
      "Pre-Medical": ["DJ Science College", "Adamjee Government Science College", "Bahria College Karachi"],
      Medical: ["DJ Science College", "Adamjee Government Science College", "Bahria College Karachi"],
      Commerce: ["Commecs College", "Government Degree Commerce College", "Bahria College Karachi"],
      Humanities: ["PECHS College", "Bahria College Karachi", "Government College for Women"],
      "Humanities / Arts": ["PECHS College", "Bahria College Karachi", "Government College for Women"],
      Arts: ["PECHS College", "Bahria College Karachi", "Government College for Women"],
    };

    const countryMap: Record<string, string[]> = {
      "Pre-Engineering": ["Punjab College", "Government College Lahore", "Superior College"],
      Engineering: ["Punjab College", "Government College Lahore", "Superior College"],
      "Pre-Medical": ["Punjab College", "Government College Lahore", "Kinnaird College"],
      Medical: ["Punjab College", "Government College Lahore", "Kinnaird College"],
      Commerce: ["Punjab College of Commerce", "Lahore College of Commerce", "Superior College"],
      Humanities: ["Kinnaird College", "Lahore College for Women", "Punjab College"],
      "Humanities / Arts": ["Kinnaird College", "Lahore College for Women", "Punjab College"],
      Arts: ["Kinnaird College", "Lahore College for Women", "Punjab College"],
    };

    return {
      cityInstitutes: cityMap[normalizedField] || ["No mapped college yet"],
      countryInstitutes: countryMap[normalizedField] || ["No mapped college yet"],
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

      const response = await fetch(apiUrl("/api/questionnaire/q2"), {
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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          O-Level / Matric Academic Assessment
        </h1>
        <p className="mb-8 text-gray-600">
          Complete this assessment to receive a personalized college stream recommendation from BeGuided.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* keep your current questionnaire 2 fields exactly as they are */}

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Academic Performance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Which education system did you study in?</label>
                <select name="previous_system" value={formData.previous_system} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="O-Level">O-Level</option>
                  <option value="Matric">Matric</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Which category/stream did you study?</label>
                <select name="previous_stream" value={formData.previous_stream} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Pre-Medical">Pre-Medical</option>
                  <option value="Pre-Engineering">Pre-Engineering</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Humanities / Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Overall academic performance so far</label>
                <select name="academic_performance" value={formData.academic_performance} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Below Average">Below Average</option>
                  <option value="Average">Average</option>
                  <option value="Good">Good</option>
                  <option value="Excellent">Excellent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Subjects you score highest in</label>
                <select name="strong_subject" value={formData.strong_subject} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Math">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Subjects you struggle with the most</label>
                <select name="weak_area" value={formData.weak_area} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Math">Mathematics</option>
                  <option value="Science">Science subjects</option>
                  <option value="Writing">Writing-based subjects</option>
                  <option value="Memorization">Memorization-heavy subjects</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Interests & Hobbies</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Subjects you enjoy most</label>
                <select name="interest_area" value={formData.interest_area} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Problem solving">Mathematics</option>
                  <option value="Research">Science</option>
                  <option value="Business">Business</option>
                  <option value="Creative">Arts</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Study Habits & Work Style</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">I can study independently</label>
                <select name="study_independence" value={formData.study_independence} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="Somewhat">Somewhat</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">I can manage long study hours</label>
                <select name="study_hours" value={formData.study_hours} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Cognitive & Decision Making</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">I enjoy analytical subjects</label>
                <select name="analytical_skill" value={formData.analytical_skill} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Strongly Agree">Strongly Agree</option>
                  <option value="Agree">Agree</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Disagree">Disagree</option>
                  <option value="Strongly Disagree">Strongly Disagree</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">When a topic is difficult</label>
                <select name="problem_handling" value={formData.problem_handling} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Keep Trying">Keep trying</option>
                  <option value="Ask Help">Ask for help</option>
                  <option value="Avoid">Avoid it</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Environment & Career Direction</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-gray-700">Access to tuition/support</label>
                <select name="tuition_access" value={formData.tuition_access} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="Limited">Limited</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Where do you want to study?</label>
                <select name="study_preference" value={formData.study_preference} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Continuous">Same city</option>
                  <option value="Exams">Another city (within country)</option>
                  <option value="Exams">International</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Career clarity</label>
                <select name="career_clarity" value={formData.career_clarity} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Clear">Clear</option>
                  <option value="Somewhat">Somewhat clear</option>
                  <option value="Not clear">Not clear</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Decision based on</label>
                <select name="decision_factor" value={formData.decision_factor} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Interest">Personal interest</option>
                  <option value="Career">Career requirements</option>
                  <option value="Family">Family pressure</option>
                  <option value="Peer">Peer influence</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">Confidence level</label>
                <select name="confidence_level" value={formData.confidence_level} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
                  <option value="">Select</option>
                  <option value="Confident">Confident</option>
                  <option value="Unsure">Unsure</option>
                  <option value="Not confident">Not confident</option>
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