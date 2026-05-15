"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuidePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/guide/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <p className="text-lg">Redirecting to guide dashboard...</p>
    </main>
  );
}