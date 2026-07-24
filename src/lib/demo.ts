import { DEMO_COOKIE } from "@/lib/constants";

export { DEMO_COOKIE };

export function enableDemoMode() {
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

export function disableDemoMode() {
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isDemoModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${DEMO_COOKIE}=1`));
}
