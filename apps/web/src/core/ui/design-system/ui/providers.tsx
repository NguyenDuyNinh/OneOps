"use client";
import { UIPreferencesProvider } from "@/core/ui/design-system/ui/primitives/preferences";
import { WorkspaceProvider } from "@/core/ui/design-system/ui/primitives/workspace";
export function DesignSystemProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIPreferencesProvider>
      <WorkspaceProvider renderCreate={() => null}>
        {children}
      </WorkspaceProvider>
    </UIPreferencesProvider>
  );
}
