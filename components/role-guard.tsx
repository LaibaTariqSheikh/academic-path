"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RoleGuard({
  role,
  children,
}: {
  role: "student" | "guide" | "admin";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== role) {
      if (user.role === "student") router.replace("/student/dashboard");
      else if (user.role === "guide") router.replace("/guide/dashboard");
      else if (user.role === "admin") router.replace("/admin/dashboard");
      else router.replace("/");
    }
  }, [hydrated, user, role, router]);

  if (!hydrated || !user || user.role !== role) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="rounded-2xl border border-neutral-300 bg-white px-6 py-4 text-neutral-900 shadow dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
          Checking access...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}