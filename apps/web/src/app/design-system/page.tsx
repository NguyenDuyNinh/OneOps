import { DesignSystemProviders } from "@/core/ui/design-system/ui/providers";
import type { Metadata } from "next";
import { DesignSystem } from "@/core/ui/design-system/ui/design-system";
export const metadata: Metadata = { title: "Thư viện UI · Design System" };
export default function Page() {
  return (
    <DesignSystemProviders>
      <DesignSystem />
    </DesignSystemProviders>
  );
}
