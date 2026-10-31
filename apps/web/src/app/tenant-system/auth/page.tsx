import {
  ModulePage,
  definition,
} from "@/features/tenant-system/access-control/tenant-auth";
export const metadata = { title: definition.label };
export default function Page() {
  return <ModulePage />;
}
