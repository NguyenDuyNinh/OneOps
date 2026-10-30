import { ModulePage } from "@/features/work-management/work/tasks";
export const metadata = { title: "Kanban" };
export default function Page() {
  return <ModulePage initialView="board" />;
}
