"use client";
import { ModulePage as Content } from "@/features/work-management/projects/timesheets/components/page";
import { WeekForm } from "@/features/work-management/projects/timesheets/components/week-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/work-management/projects/timesheets/components/primitives/workspace";

export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Mở tuần công" onClose={close}>
          <WeekForm onClose={close} />
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
      <WeekForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
