"use client";
import { ModulePage as Content } from "@/features/hr-management/organization/departments-teams/components/page";
import { DepartmentForm } from "@/features/hr-management/organization/departments-teams/components/org-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/hr-management/organization/departments-teams/components/primitives/workspace";
export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Tạo phòng ban" onClose={close}>
          <DepartmentForm onClose={close} />
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
      <DepartmentForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
