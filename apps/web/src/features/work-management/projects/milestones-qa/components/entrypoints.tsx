"use client";
import { ModulePage as Content } from "@/features/work-management/projects/milestones-qa/components/page";
import { RecordForm } from "@/features/work-management/projects/milestones-qa/components/record-form";
import { useReferences } from "@/features/work-management/projects/milestones-qa/hooks/use-references";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/work-management/projects/milestones-qa/components/primitives/workspace";

/** The create form needs a project to attach to, so it resolves the options itself. */
function CreateMilestone({ onClose }: { onClose: () => void }) {
  const { projects, loading, error } = useReferences();
  if (loading) return <p role="status">Đang tải danh mục dự án…</p>;
  if (error)
    return (
      <p role="alert" className="error">
        {error}
      </p>
    );
  if (!projects.length)
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có dự án nào. Hãy tạo dự án trước khi thêm mốc.
      </p>
    );
  return <RecordForm projects={projects} onClose={onClose} />;
}

export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Tạo mốc" onClose={close}>
          <CreateMilestone onClose={close} />
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
      <CreateMilestone onClose={onClose} />
    </WorkspaceProvider>
  );
}
