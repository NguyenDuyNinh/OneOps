import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from "@/core/context/SidebarContext";
import { ThemeProvider } from "@/core/context/ThemeContext";

// Be Vietnam Pro — font thiết kế riêng cho tiếng Việt (đủ glyph có dấu: ơ ư â ê ô ă đ...).
// Thay cho Outfit vốn chỉ load subset latin và render dấu tiếng Việt không đẹp.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
