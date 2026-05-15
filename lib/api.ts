export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";

export function apiUrl(path: string) {
  return `${BACKEND_URL}${path}`;
}