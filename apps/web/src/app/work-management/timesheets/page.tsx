import {
  ModulePage,
  definition,
} from "@/features/work-management/projects/timesheets";
export const metadata = { title: definition.label };
export default function Page() {
  return <ModulePage />;
}
