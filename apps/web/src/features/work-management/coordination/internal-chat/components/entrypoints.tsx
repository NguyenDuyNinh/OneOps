"use client";
import { ModulePage as Content } from "@/features/work-management/coordination/internal-chat/components/page";
import { RecordForm } from "@/features/work-management/coordination/internal-chat/components/record-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/work-management/coordination/internal-chat/components/primitives/workspace";
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
