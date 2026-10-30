"use client";
import { WorkspaceProvider } from "@/core/ui/primitives/workspace";
import { UIPreferencesProvider } from "@/core/ui/primitives/preferences";
import { CreateRecord } from "@/core/layout/workspace-create";
export function ApplicationProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIPreferencesProvider>
      <WorkspaceProvider
        renderCreate={(close) => <CreateRecord onClose={close} />}
      >
        {children}
      </WorkspaceProvider>
    </UIPreferencesProvider>
  );
}
