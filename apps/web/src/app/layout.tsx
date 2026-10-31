import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { ThemeProvider } from "@/features/auth";
import { SidebarProvider } from "@/features/admin/app-shell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
