"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/dashboard-navbar";
import RoleGuard from "@/components/role-guard";
import LoadingCard from "@/components/ui/loading-card";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast-provider";
import { authFetch } from "@/lib/authFetch";
import { apiUrl } from "@/lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type AdminUserItem = {
  id: number;
  name: string;
  email: string;
  role: string;
  institute: string;
  city?: string;
  grade?: string;
  institute_code?: string;
};

type AdminGuideItem = {
  id: number;
  name: string;
  email: string;
  institute: string;
};

type AdminAnalyticsData = {
  students: number;
  guides: number;
  admins: number;
  totalUsers: number;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [guides, setGuides] = useState<AdminGuideItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData>({
    students: 0,
    guides: 0,
    admins: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [selectedGuide, setSelectedGuide] = useState<Record<number, string>>({});

  const institute = user?.institute || "";

  const fetchUsers = async () => {
    if (!institute) return;

    const response = await authFetch(
      apiUrl(`/api/admin/users/${encodeURIComponent(institute)}`));

    const data = await response.json();
    setUsers(data);
  };

  const fetchGuides = async () => {
    if (!institute) return;

    const response = await authFetch(
      apiUrl(`/api/admin/guides/${encodeURIComponent(institute)}`));

    const data = await response.json();
    setGuides(data);
  };

  const fetchAnalytics = async () => {
    if (!institute) return;

    const response = await authFetch(
      apiUrl(`/api/admin/analytics/${encodeURIComponent(institute)}`));

    const data = await response.json();
    setAnalyticsData(data);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchGuides(), fetchAnalytics()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [institute]);

  const filteredUsers = useMemo(() => {
    if (filterRole === "all") return users;
    return users.filter((u) => u.role === filterRole);
  }, [users, filterRole]);

  const handleDeleteUser = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const response = await authFetch(apiUrl(`/api/admin/users/${id}`), {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("Delete failed", data.error || "Failed to delete user.", "error");
        throw new Error(data.error || "Failed to delete user");
      }

      showToast("User deleted", "User deleted successfully.", "success");
      await fetchUsers();
      await fetchAnalytics();
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const handleAssignGuide = async (studentId: number) => {
    const guideId = selectedGuide[studentId];

    if (!guideId) {
      showToast("Guide required", "Please select a guide first.", "error");
      return;
    }

    try {
      const response = await authFetch(apiUrl("/api/admin/assign-guide"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          guide_id: Number(guideId),
          admin_id: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("Assignment failed", data.error || "Failed to assign guide.", "error");
        throw new Error(data.error || "Failed to assign guide");
      }

      showToast("Guide assigned", "Guide assigned successfully.", "success");
    } catch (error) {
      console.error("Assign guide error:", error);
    }
  };

  return (
    <RoleGuard role="admin">
       <main className="force-light-dashboard min-h-screen bg-neutral-100 text-neutral-900">
        <DashboardNavbar />

        <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          {loading ? (
            <>
              <div className="grid gap-6 md:grid-cols-4">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <LoadingCard />
                <LoadingCard />
              </div>
              <LoadingCard />
            </>
          ) : (
            <>
              <div className="mb-8 grid gap-6 md:grid-cols-4">
                <div className="surface p-6">
                  <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Users</h2>
                  <p className="mt-2 text-3xl font-bold">{analyticsData.totalUsers}</p>
                </div>

                <div className="surface p-6">
                  <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Students</h2>
                  <p className="mt-2 text-3xl font-bold">{analyticsData.students}</p>
                </div>

                <div className="surface p-6">
                  <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Guides</h2>
                  <p className="mt-2 text-3xl font-bold">{analyticsData.guides}</p>
                </div>

                <div className="surface p-6">
                  <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Admins</h2>
                  <p className="mt-2 text-3xl font-bold">{analyticsData.admins}</p>
                </div>
              </div>

              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div className="surface p-6">
                  <h3 className="mb-4 text-xl font-semibold">User Distribution</h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "Students", value: analyticsData.students },
                        { name: "Guides", value: analyticsData.guides },
                        { name: "Admins", value: analyticsData.admins },
                      ]}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="surface p-6">
                  <h3 className="mb-4 text-xl font-semibold">Role Ratio</h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Students", value: analyticsData.students },
                          { name: "Guides", value: analyticsData.guides },
                          { name: "Admins", value: analyticsData.admins },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                      >
                        {[0, 1, 2].map((_, index) => (
                          <Cell key={index} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="surface p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-bold">Institute Users</h2>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="guide">Guides</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {filteredUsers.length === 0 ? (
                  <EmptyState
                    title="No users found"
                    description="There are no users matching this filter."
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-neutral-300 p-5 dark:border-neutral-700"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.name}
                            </h3>
                            <p><strong>Email:</strong> {item.email}</p>
                            <p><strong>Role:</strong> {item.role}</p>
                            <p><strong>Institute:</strong> {item.institute}</p>
                            <p><strong>City:</strong> {item.city || "-"}</p>
                            <p><strong>Grade:</strong> {item.grade || "-"}</p>
                            <p><strong>Institute Code:</strong> {item.institute_code || "-"}</p>

                            {item.role === "student" && (
                              <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
                                <select
                                  value={selectedGuide[item.id] || ""}
                                  onChange={(e) =>
                                    setSelectedGuide((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  className="rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                  <option value="">Select Guide</option>
                                  {guides.map((guide) => (
                                    <option key={guide.id} value={guide.id}>
                                      {guide.name}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => handleAssignGuide(item.id)}
                                  className="rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                                >
                                  Assign Guide
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteUser(item.id)}
                            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                          >
                            Delete User
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </RoleGuard>
  );
}