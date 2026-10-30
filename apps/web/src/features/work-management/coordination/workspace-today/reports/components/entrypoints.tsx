"use client";
import { ModulePage as Content } from "@/features/work-management/coordination/workspace-today/reports/components/page";
import { RecordForm } from "@/features/work-management/coordination/workspace-today/reports/components/record-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/work-management/coordination/workspace-today/reports/components/primitives/workspace";
export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Tạo mới" onClose={close}>
          <RecordForm onClose={close} />
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
      <RecordForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
