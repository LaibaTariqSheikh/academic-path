"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Roles", href: "#roles" },
];

export default function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/75 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-black tracking-[-0.03em] text-neutral-950 dark:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg dark:bg-white dark:text-neutral-950">
            <Sparkles size={18} />
          </span>
          AI Academic Path
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
            >
              Login
            </motion.button>
          </Link>

          <Link href="/auth/signup">
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </header>
  );
}