"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/dashboard-navbar";
import RoleGuard from "@/components/role-guard";
import LoadingCard from "@/components/ui/loading-card";
import EmptyState from "@/components/ui/empty-state";
import { authFetch } from "@/lib/authFetch";
import { apiUrl } from "@/lib/api";

type RecommendationData = {
  id?: number;
  field: string;
  skills: string[];
  cityInstitutes: string[];
  countryInstitutes: string[];
  created_at?: string;
};

type AssignedGuide = {
  id: number;
  name: string;
  email: string;
  institute: string;
} | null;

type GuideComment = {
  id: number;
  comment_text: string;
  created_at: string;
  guide_name: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [recommendation, setRecommendation] =
    useState<RecommendationData | null>(null);
  const [recommendationHistory, setRecommendationHistory] = useState<
    RecommendationData[]
  >([]);
  const [assignedGuide, setAssignedGuide] = useState<AssignedGuide>(null);
  const [guideComments, setGuideComments] = useState<GuideComment[]>([]);
  const [loading, setLoading] = useState(true);

  const isIndividualStudent = user?.account_type === "individual";

  const fetchLatestRecommendation = async () => {
    if (!user?.id) return;

    const response = await authFetch(
    apiUrl(`/api/questionnaire/latest-recommendation/${user.id}`));

    const data = await response.json();
    setRecommendation(data || null);
  };

  const fetchRecommendationHistory = async () => {
    if (!user?.id) return;

    const response = await authFetch(
      apiUrl(`/api/questionnaire/recommendation-history/${user.id}`));

    const data = await response.json();
    setRecommendationHistory(Array.isArray(data) ? data : []);
  };

  const fetchAssignedGuide = async () => {
    if (!user?.id) return;

    if (user.account_type !== "institute") {
      setAssignedGuide(null);
      return;
    }

    const response = await authFetch(
      apiUrl(`/api/guide/assigned-guide/${user.id}`));

    const data = await response.json();
    setAssignedGuide(data);
  };

  const fetchGuideComments = async () => {
    if (!user?.id || user.account_type !== "institute") {
      setGuideComments([]);
      return;
    }

    const response = await authFetch(
      apiUrl(`/api/guide/comments-by-student/${user.id}`));

    const data = await response.json();
    setGuideComments(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;

      setLoading(true);

      try {
        await Promise.all([
          fetchLatestRecommendation(),
          fetchRecommendationHistory(),
          fetchAssignedGuide(),
          fetchGuideComments(),
        ]);
      } catch (error) {
        console.error("Student dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user?.id, user?.account_type]);

  const openQuestionnaire = () => {
    if (user?.grade === "grade8") router.push("/student/questionnaire");
    else router.push("/student/questionnaire2");
  };

  return (
    <RoleGuard role="student">
      <main className="min-h-screen bg-neutral-100 text-neutral-900">
        <DashboardNavbar />

        <div className="mx-auto max-w-6xl p-6">
          {loading ? (
            <div className="grid gap-6">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : (
            <>
              <section className="mb-6 rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Account Mode
                </p>

                <h1 className="mt-2 text-3xl font-bold text-neutral-950">
                  {isIndividualStudent
                    ? "Individual Student Dashboard"
                    : "Institute Student Dashboard"}
                </h1>

                <p className="mt-3 text-neutral-600">
                  {isIndividualStudent
                    ? "You are using the system independently. You can generate recommendations without institute approval."
                    : "You are connected with an institute. Your admin can assign a guide to support your academic journey."}
                </p>
              </section>

              <div className="mb-6 grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xl font-semibold text-neutral-950">
                    Recommendation Form
                  </h2>
                  <p className="mb-4 text-neutral-600">
                    Fill the questionnaire to get your academic recommendation.
                  </p>
                  <button
                    onClick={openQuestionnaire}
                    className="rounded-lg bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800"
                  >
                    Open Questionnaire
                  </button>
                </section>

                <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xl font-semibold text-neutral-950">
                    Profile Summary
                  </h2>
                  <div className="space-y-2 text-neutral-700">
                    <p>
                      <strong>Name:</strong> {user?.name || "-"}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email || "-"}
                    </p>
                    <p>
                      <strong>Account Type:</strong>{" "}
                      {isIndividualStudent ? "Individual" : "Institute"}
                    </p>
                    <p>
                      <strong>Institute:</strong>{" "}
                      {user?.institute || "Not linked with institute"}
                    </p>
                    <p>
                      <strong>City:</strong> {user?.city || "-"}
                    </p>
                    <p>
                      <strong>Level:</strong> {user?.grade || "-"}
                    </p>
                  </div>
                </section>
              </div>

              {!isIndividualStudent && (
                <section className="mb-6 rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-2xl font-bold text-neutral-950">
                    Assigned Guide
                  </h2>

                  {!assignedGuide ? (
                    <EmptyState
                      title="No guide assigned yet"
                      description="Your institute admin has not assigned a guide yet."
                    />
                  ) : (
                    <div className="space-y-2 text-neutral-700">
                      <p>
                        <strong>Name:</strong> {assignedGuide.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {assignedGuide.email}
                      </p>
                      <p>
                        <strong>Institute:</strong> {assignedGuide.institute}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {!isIndividualStudent && (
                <section className="mb-6 rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-2xl font-bold text-neutral-950">
                    Guide Comments
                  </h2>

                  {guideComments.length === 0 ? (
                    <EmptyState
                      title="No guide comments yet"
                      description="Your assigned guide has not added any comments yet."
                    />
                  ) : (
                    <div className="space-y-4">
                      {guideComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-neutral-300 bg-neutral-50 p-4"
                        >
                          <p className="text-neutral-800">
                            {comment.comment_text}
                          </p>
                          <p className="mt-2 text-sm text-neutral-500">
                            By {comment.guide_name} •{" "}
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {isIndividualStudent && (
                <section className="mb-6 rounded-2xl border border-neutral-300 bg-neutral-50 p-6">
                  <h2 className="text-xl font-semibold text-neutral-950">
                    Independent Recommendation Mode
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    Guide assignment and institutional feedback are available only
                    for students connected with an institute. You can still use AI
                    recommendations independently.
                  </p>
                </section>
              )}

              <section className="mb-6 rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-neutral-950">
                  Latest Recommendation
                </h2>

                {!recommendation ? (
                  <EmptyState
                    title="No recommendation yet"
                    description="Complete your questionnaire to see your recommendation."
                  />
                ) : (
                  <RecommendationBlock
                    recommendation={recommendation}
                    assignedGuide={assignedGuide}
                    showGuide={!isIndividualStudent}
                  />
                )}
              </section>

              <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-bold text-neutral-950">
                  Recommendation History
                </h2>

                {recommendationHistory.length === 0 ? (
                  <EmptyState
                    title="No history yet"
                    description="Your previous recommendations will appear here after you submit questionnaires."
                  />
                ) : (
                  <div className="space-y-4">
                    {recommendationHistory.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="rounded-2xl border border-neutral-300 bg-neutral-50 p-5"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-neutral-500">
                              Recommendation #{recommendationHistory.length - index}
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-neutral-950">
                              {item.field}
                            </h3>
                            {item.created_at && (
                              <p className="mt-1 text-sm text-neutral-500">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                              {(Array.isArray(item.skills) ? item.skills : []).slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-neutral-200 px-3 py-1 text-xs text-neutral-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </RoleGuard>
  );
}

function RecommendationBlock({
  recommendation,
  assignedGuide,
  showGuide,
}: {
  recommendation: RecommendationData;
  assignedGuide: AssignedGuide;
  showGuide: boolean;
}) {
  const skills = Array.isArray(recommendation.skills)
    ? recommendation.skills
    : [];

  const cityInstitutes = Array.isArray(recommendation.cityInstitutes)
    ? recommendation.cityInstitutes
    : [];

  const countryInstitutes = Array.isArray(recommendation.countryInstitutes)
    ? recommendation.countryInstitutes
    : [];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <h3 className="text-xl font-semibold text-neutral-950">
          Recommended Path
        </h3>
        <p className="mt-2 text-lg text-neutral-700">{recommendation.field}</p>
      </div>

      {showGuide && (
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
          <h3 className="text-xl font-semibold text-neutral-950">
            Assigned Guide for This Journey
          </h3>

          {!assignedGuide ? (
            <p className="mt-2 text-neutral-600">No guide assigned yet.</p>
          ) : (
            <div className="mt-2 space-y-1 text-neutral-700">
              <p>
                <strong>Name:</strong> {assignedGuide.name}
              </p>
              <p>
                <strong>Email:</strong> {assignedGuide.email}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-xl font-semibold text-neutral-950">
          Suggested Skills
        </h3>

        {skills.length === 0 ? (
          <p className="text-neutral-600">No skills available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-neutral-200 px-4 py-2 text-sm text-neutral-900"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xl font-semibold text-neutral-950">
            Recommended Institutes in Your City
          </h3>
          <div className="space-y-3">
            {cityInstitutes.length === 0 ? (
              <p className="text-neutral-600">No city institutes available yet.</p>
            ) : (
              cityInstitutes.map((institute, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-800"
                >
                  {institute}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xl font-semibold text-neutral-950">
            Recommended Institutes in Pakistan
          </h3>
          <div className="space-y-3">
            {countryInstitutes.length === 0 ? (
              <p className="text-neutral-600">
                No Pakistan institutes available yet.
              </p>
            ) : (
              countryInstitutes.map((institute, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-neutral-800"
                >
                  {institute}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}