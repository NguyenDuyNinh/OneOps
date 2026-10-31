"use client";
import { ModulePage as Content } from "@/features/hr-management/organization/positions-grades/components/page";
import { PositionForm } from "@/features/hr-management/organization/positions-grades/components/position-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/hr-management/organization/positions-grades/components/primitives/workspace";
export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Tạo chức danh" onClose={close}>
          <PositionForm onClose={close} />
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
      <PositionForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
