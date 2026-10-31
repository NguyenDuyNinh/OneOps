"use client";
import { WorkspaceProvider } from "@/core/ui/primitives/workspace";
import { UIPreferencesProvider } from "@/core/ui/primitives/preferences";
import { CreateRecord } from "@/core/layout/workspace-create";
import { SessionProvider } from "@/features/tenant-system/access-control/tenant-auth/index";
export function ApplicationProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UIPreferencesProvider>
        <WorkspaceProvider
          renderCreate={(close) => <CreateRecord onClose={close} />}
        >
          {children}
        </WorkspaceProvider>
      </UIPreferencesProvider>
    </SessionProvider>
  );
}
