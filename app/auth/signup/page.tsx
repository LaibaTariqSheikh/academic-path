"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { apiUrl } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState<"individual" | "institute">(
    "individual"
  );
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institute: "",
    city: "",
    grade: "",
    institute_code: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAccountTypeChange = (value: "individual" | "institute") => {
    setAccountType(value);

    if (value === "individual") {
      setRole("student");
      setFormData((prev) => ({
        ...prev,
        institute: "",
        institute_code: "",
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload =
        accountType === "individual"
          ? {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: "student",
              account_type: "individual",
              institute: null,
              city: formData.city,
              grade: formData.grade,
              institute_code: null,
            }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role,
              account_type: "institute",
              institute: formData.institute,
              city: role === "student" ? formData.city : null,
              grade: role === "student" ? formData.grade : null,
              institute_code:
                role === "guide" || role === "admin"
                  ? formData.institute_code
                  : null,
            };

      const response = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();

      let data: { error?: string; message?: string } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        showToast("Signup failed", "Backend returned invalid response.", "error");
        throw new Error("Backend returned invalid response");
      }

      if (!response.ok) {
        const msg = data.error || data.message || "Signup failed";
        showToast("Signup failed", msg, "error");
        throw new Error(msg);
      }

      showToast(
        "Account created",
        "Your account was created successfully.",
        "success"
      );

      router.push("/auth/login");
    } catch (err) {
      console.error("Signup frontend error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Choose whether you are using the platform individually or through an
          institute.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAccountTypeChange("individual")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              accountType === "individual"
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            Individual Student
          </button>

          <button
            type="button"
            onClick={() => handleAccountTypeChange("institute")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              accountType === "institute"
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            Institute User
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {accountType === "institute" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
              >
                <option value="student">Student</option>
                <option value="guide">Career Guide</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
              required
            />
          </div>

          {accountType === "institute" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Institute Name
              </label>
              <input
                type="text"
                name="institute"
                placeholder="Enter institute name"
                value={formData.institute}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
                required
              />
            </div>
          )}

          {(accountType === "individual" || role === "student") && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
                  required
                >
                  <option value="">Select level</option>
                  <option value="grade8">Grade 8</option>
                  <option value="olevel-matric">O-Level / Matric</option>
                </select>
              </div>
            </>
          )}

          {accountType === "institute" &&
            (role === "guide" || role === "admin") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Institute Code
                </label>
                <input
                  type="text"
                  name="institute_code"
                  placeholder="Enter institute code"
                  value={formData.institute_code}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:border-black"
                  required
                />
              </div>
            )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}