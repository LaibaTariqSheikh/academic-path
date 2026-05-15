export default function LoadingCard() {
  return (
    <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-10 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}