"use client";
import { ModulePage as Content } from "@/features/hr-management/employees/employee-directory/components/page";
import { EmployeeForm } from "@/features/hr-management/employees/employee-directory/components/employee-form";
import {
  WorkspaceProvider,
  Modal,
} from "@/features/hr-management/employees/employee-directory/components/primitives/workspace";
export function ModulePage() {
  return (
    <WorkspaceProvider
      renderCreate={(close) => (
        <Modal title="Thêm nhân viên" onClose={close}>
          <EmployeeForm onClose={close} />
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
      <EmployeeForm onClose={onClose} />
    </WorkspaceProvider>
  );
}
