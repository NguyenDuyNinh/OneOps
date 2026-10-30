"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { modules } from "@/core/config/feature-registry";
import { moduleForms } from "@/core/config/feature-forms";
import { Modal, useWorkspace } from "@/core/ui/primitives/workspace";
import { Select } from "@/core/ui/primitives/forms";
export function CreateRecord({ onClose }: { onClose: () => void }) {
  const { notify } = useWorkspace();
  const route = usePathname().replace(/^\/|\/$/g, "");
  const [selected, setSelected] = useState<keyof typeof moduleForms>(
    route in moduleForms
      ? (route as keyof typeof moduleForms)
      : "work-management/tasks",
  );
  const Form = moduleForms[selected];
  return (
    <Modal title="Tạo mới" onClose={onClose}>
      <div className="form-body !pb-0">
        <label>
          Phân hệ
          <Select
            value={selected}
            onChange={(event) =>
              setSelected(event.target.value as keyof typeof moduleForms)
            }
          >
            {modules
              .filter((item) => item.id in moduleForms)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
          </Select>
        </label>
      </div>
      <Form key={selected} onClose={onClose} onNotify={notify} />
    </Modal>
  );
}
