"use client";
import { ModulePage as Content } from "@/features/tenant-system/access-control/accounts/components/page";
import { AccountForm } from "@/features/tenant-system/access-control/accounts/components/account-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/tenant-system/access-control/accounts/components/primitives/workspace";
export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Thêm tài khoản" onClose={close}>
          <AccountForm onClose={close} />
        </Modal>
      )}
    >
      <Content />
    </WorkspaceProvider>
  );
}
export function CreateForm({
  onClose,
  onNotify,
}: {
  onClose: () => void;
  onNotify?: (message: string) => void;
}) {
  return (
    <WorkspaceProvider renderCreate={() => null} onNotify={onNotify}>
      <AccountForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
