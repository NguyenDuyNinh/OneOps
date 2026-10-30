"use client";
import { ModulePage as Content } from "@/features/work-management/work/tasks/components/page";
import { RecordForm } from "@/features/work-management/work/tasks/components/record-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/work-management/work/tasks/components/primitives/workspace";
export function ModulePage({
  initialView = "list",
}: {
  initialView?: "list" | "board";
}) {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Tạo mới" onClose={close}>
          <RecordForm onClose={close} />
        </Modal>
      )}
    >
      <Content initialView={initialView} />
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
