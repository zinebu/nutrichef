export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "cherry_theme";
export const DEFAULT_THEME: ThemePreference = "light";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : DEFAULT_THEME;
}

export function applyTheme(preference: ThemePreference) {
  document.documentElement.setAttribute("data-theme", preference);
}

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"${DEFAULT_THEME}";if(t!=="light"&&t!=="dark"&&t!=="system")t="${DEFAULT_THEME}";document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}")}})();`;
