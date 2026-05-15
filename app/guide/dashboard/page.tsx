"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/dashboard-navbar";
import RoleGuard from "@/components/role-guard";
import LoadingCard from "@/components/ui/loading-card";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast-provider";
import { authFetch } from "@/lib/authFetch";
import { apiUrl } from "@/lib/api";

type CommentItem = {
  id: number;
  comment_text: string;
  created_at: string;
  guide_name: string;
};

type RecommendationItem = {
  id: number;
  field: string;
  skills: string[];
  cityInstitutes: string[];
  countryInstitutes: string[];
  created_at: string;
};

type StudentData = {
  id: number;
  name: string;
  email: string;
  institute: string;
  city: string;
  grade: string;
  recommendation: string | null;
  recommendationHistory: RecommendationItem[];
  latestComment: CommentItem | null;
  commentHistory: CommentItem[];
};

export default function GuideDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const fetchStudents = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await authFetch(
        apiUrl(`/api/guide/students-by-guide/${user.id}`));

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Guide fetch error:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user?.id]);

  const handleCommentChange = (studentId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const submitComment = async (studentId: number) => {
    const comment_text = commentInputs[studentId]?.trim();

    if (!comment_text || !user?.id) {
      showToast("Comment required", "Please write a comment first.", "error");
      return;
    }

    try {
      const response = await authFetch(apiUrl("/api/guide/comment"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          guide_id: user.id,
          comment_text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("Comment failed", data.error || "Failed to add comment.", "error");
        throw new Error(data.error || "Failed to add comment");
      }

      showToast("Comment saved", "Your comment was added successfully.", "success");

      setCommentInputs((prev) => ({
        ...prev,
        [studentId]: "",
      }));

      fetchStudents();
    } catch (error) {
      console.error("Guide comment error:", error);
    }
  };

  return (
    <RoleGuard role="guide">
      <main className="force-light-dashboard min-h-screen bg-neutral-100 text-neutral-900">
        <DashboardNavbar />

        <div className="mx-auto max-w-6xl p-6">
          <div className="surface p-6">
            <h1 className="mb-2 text-3xl font-bold">Guide Dashboard</h1>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              View assigned students, their recommendations, recommendation
              history, and comment history.
            </p>

            {loading ? (
              <div className="space-y-6">
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : students.length === 0 ? (
              <EmptyState
                title="No students assigned yet"
                description="Once an admin assigns students to you, they will appear here."
              />
            ) : (
              <div className="space-y-6">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-2xl border border-neutral-300 p-5 dark:border-neutral-700"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-xl font-semibold">{student.name}</h3>

                        <div className="mt-3 space-y-2 text-neutral-700 dark:text-neutral-300">
                          <p><strong>Email:</strong> {student.email}</p>
                          <p><strong>Institute:</strong> {student.institute}</p>
                          <p><strong>City:</strong> {student.city || "-"}</p>
                          <p><strong>Level:</strong> {student.grade || "-"}</p>
                          <p>
                            <strong>Latest Recommendation:</strong>{" "}
                            {student.recommendation || "Not generated yet"}
                          </p>
                        </div>

                        <div className="mt-5 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
                          <h5 className="mb-3 font-semibold">
                            Recommendation History
                          </h5>

                          {student.recommendationHistory.length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              No recommendations generated yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {student.recommendationHistory.map((item, index) => (
                                <div
                                  key={item.id}
                                  className="rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950"
                                >
                                  <p className="text-sm font-semibold text-neutral-500">
                                    Recommendation #
                                    {student.recommendationHistory.length - index}
                                  </p>
                                  <p className="mt-1 font-bold">{item.field}</p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {new Date(item.created_at).toLocaleString()}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.skills.slice(0, 3).map((skill) => (
                                      <span
                                        key={skill}
                                        className="rounded-full bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-800"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
                          <h5 className="mb-3 font-semibold">Comment History</h5>

                          {student.commentHistory.length === 0 ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              No comments yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {student.commentHistory.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950"
                                >
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {comment.comment_text}
                                  </p>
                                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    By {comment.guide_name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-lg font-semibold">Add Comment</h4>

                        <textarea
                          value={commentInputs[student.id] || ""}
                          onChange={(e) =>
                            handleCommentChange(student.id, e.target.value)
                          }
                          placeholder="Write guidance/comment for this student..."
                          className="min-h-28 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none dark:border-neutral-700 dark:bg-neutral-900"
                        />

                        <button
                          onClick={() => submitComment(student.id)}
                          className="mt-3 rounded-lg bg-neutral-900 px-4 py-3 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                          Save Comment
                        </button>

                        <div className="mt-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
                          <h5 className="mb-2 font-semibold">Latest Comment</h5>
                          {student.latestComment ? (
                            <div className="text-neutral-700 dark:text-neutral-300">
                              <p>{student.latestComment.comment_text}</p>
                              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                By {student.latestComment.guide_name}
                              </p>
                            </div>
                          ) : (
                            <p className="text-neutral-500 dark:text-neutral-400">
                              No comment yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}