"use client";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Moon, Sun, Rows3, LayoutList } from "lucide-react";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import { Tooltip } from "@/core/ui/design-system/ui/primitives/foundations";

type Preferences = {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
};

const key = "oneops.ui-preferences.v1",
  event = "oneops-ui-preferences";

const fallback = '{"theme":"light","density":"comfortable"}';

function snapshot() {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(event, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(event, listener);
  };
}

const Context = createContext<{
  preferences: Preferences;
  update: (next: Partial<Preferences>) => void;
} | null>(null);

export function UIPreferencesProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => fallback);
  let preferences: Preferences;
  try {
    const data = JSON.parse(raw);
    preferences = {
      theme: data.theme === "dark" ? "dark" : "light",
      density: data.density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    preferences = { theme: "light", density: "comfortable" };
  }
  const { theme, density } = preferences;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
  }, [theme, density]);
  function update(next: Partial<Preferences>) {
    const value = { ...preferences, ...next };
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event(event));
    } catch {
      document.documentElement.dataset.theme = value.theme;
      document.documentElement.dataset.density = value.density;
    }
  }
  return (
    <Context.Provider value={{ preferences, update }}>
      {children}
    </Context.Provider>
  );
}

export function useUIPreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("UIPreferencesProvider required");
  return value;
}

export function AppearanceControls({ compact = false }: { compact?: boolean }) {
  const { preferences, update } = useUIPreferences();
  return (
    <div className="flex items-center gap-1 rounded-control border border-border bg-surface p-1">
      <Tooltip
        content={
          preferences.theme === "light"
            ? "Chuyển sang giao diện tối"
            : "Chuyển sang giao diện sáng"
        }
      >
        <Button
          variant="ghost"
          size="sm"
          className={compact ? "size-7 px-0" : "gap-2"}
          aria-label="Đổi giao diện sáng tối"
          aria-pressed={preferences.theme === "dark"}
          onClick={() =>
            update({ theme: preferences.theme === "light" ? "dark" : "light" })
          }
        >
          {preferences.theme === "light" ? <Sun /> : <Moon />}
          {!compact && (preferences.theme === "light" ? "Sáng" : "Tối")}
        </Button>
      </Tooltip>
      <span className="mx-1 h-4 w-px bg-border" />
      <Tooltip
        content={
          preferences.density === "comfortable"
            ? "Chuyển sang mật độ gọn"
            : "Chuyển sang mật độ thoáng"
        }
      >
        <Button
          variant="ghost"
          size="sm"
          className={compact ? "size-7 px-0" : "gap-2"}
          aria-label="Đổi mật độ hiển thị"
          aria-pressed={preferences.density === "compact"}
          onClick={() =>
            update({
              density:
                preferences.density === "comfortable"
                  ? "compact"
                  : "comfortable",
            })
          }
        >
          {preferences.density === "comfortable" ? <Rows3 /> : <LayoutList />}
          {!compact &&
            (preferences.density === "comfortable" ? "Thoáng" : "Gọn")}
        </Button>
      </Tooltip>
    </div>
  );
}
