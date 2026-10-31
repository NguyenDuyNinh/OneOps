import {
  ModulePage,
  definition,
} from "@/features/hr-management/employees/employee-directory";
export const metadata = { title: definition.label };
export default function Page() {
  return <ModulePage />;
}
