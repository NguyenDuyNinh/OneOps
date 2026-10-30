import { DesignSystemProviders } from "@/core/ui/design-system/ui/providers";
import type { Metadata } from "next";
import { TokenStudio } from "@/core/ui/design-system/ui/token-studio";
export const metadata: Metadata = { title: "Design Tokens · OneOps UI" };
export default function Page() {
  return (
    <DesignSystemProviders>
      <TokenStudio />
    </DesignSystemProviders>
  );
}
