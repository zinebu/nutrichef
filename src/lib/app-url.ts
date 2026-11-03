export function getAppUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envUrl) return envUrl.replace(/\/$/, "");

  if (typeof window !== "undefined") return window.location.origin;

  return "http://localhost:3000";
}
