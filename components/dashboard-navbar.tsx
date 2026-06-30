"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  UserRound,
  Shield,
  GraduationCap,
} from "lucide-react";
import NotificationBell from "@/components/notification-bell";
import { useToast } from "@/components/ui/toast-provider";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const links =
    user?.role === "student"
      ? [{ href: "/student/dashboard", label: "Student Dashboard", icon: GraduationCap }]
      : user?.role === "guide"
      ? [{ href: "/guide/dashboard", label: "Guide Dashboard", icon: UserRound }]
      : user?.role === "admin"
      ? [{ href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield }]
      : [];

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-black tracking-[-0.03em]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg dark:bg-white dark:text-neutral-950">
            <LayoutDashboard size={18} />
          </span>
          BeGuided
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ y: -1, scale: 1.01 }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-neutral-950 text-white shadow-lg shadow-neutral-900/15 dark:bg-white dark:text-neutral-950"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {user?.id && <NotificationBell userId={user.id} />}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user?.role || ""} {user?.institute ? `• ${user.institute}` : ""}
            </p>
          </div>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              logout();
              showToast("Logged out", "You have been logged out successfully.", "success");
              router.push("/");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </div>
    </header>
  );
}