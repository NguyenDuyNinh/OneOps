import data from "@/core/ui/design-system/schema/token-data.json";
export function downloadDesignTokens(theme: string, density: string) {
  const profiles = data.profiles as Record<string, unknown>;
  const profile =
    profiles[`${theme}-${density}`] || profiles["light-comfortable"];
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `oneops-${theme}-${density}.tokens.json`;
  link.click();
  URL.revokeObjectURL(url);
}
