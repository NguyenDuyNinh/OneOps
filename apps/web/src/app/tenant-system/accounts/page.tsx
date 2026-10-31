import {
  ModulePage,
  definition,
} from "@/features/tenant-system/access-control/accounts";
export const metadata = { title: definition.label };
export default function Page() {
  return <ModulePage />;
}
