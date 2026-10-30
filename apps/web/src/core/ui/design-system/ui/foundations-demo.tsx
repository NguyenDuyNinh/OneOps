"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  ArrowRight,
  Plus,
  Download,
  MoreHorizontal,
  Search,
  FileText,
  FolderOpen,
  Users,
  Building2,
  SlidersHorizontal,
  CalendarDays,
  ShieldCheck,
  Bell,
  CircleHelp,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tooltip,
} from "@/core/ui/design-system/ui/primitives/foundations";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import { useWorkspace } from "@/core/ui/design-system/ui/primitives/workspace";

const brand = [
  ["50", "#fff8f1"],
  ["100", "#ffecd6"],
  ["200", "#ffd3a8"],
  ["300", "#ffb572"],
  ["400", "#ff9142"],
  ["500", "#f06000"],
  ["600", "#de5500"],
  ["700", "#bd4600"],
  ["800", "#963a08"],
  ["900", "#79320c"],
];
export function FoundationsDemo() {
  const { notify } = useWorkspace();
  const [copied, setCopied] = useState("");
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      notify(`Đã sao chép ${value}`);
    } catch {
      notify(`Mã màu: ${value}`);
    }
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Màu thương hiệu</CardTitle>
            <CardDescription>
              Cam OneOps làm điểm nhấn. Tông 700 dành cho thao tác chính trên
              nền sáng.
            </CardDescription>
          </div>
          <Badge variant="brand">Brand orange</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {brand.map(([step, hex]) => (
              <button
                key={step}
                className="group rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
                onClick={() => copy(hex)}
                aria-label={`Sao chép màu brand ${step}: ${hex}`}
              >
                <span
                  className="mb-2 flex h-16 items-center justify-center rounded-lg border border-foreground/5 sm:h-20"
                  style={{ background: hex }}
                >
                  {copied === hex ? (
                    <Check
                      className={`size-4 ${Number(step) > 400 ? "text-white" : "text-brand-800"}`}
                    />
                  ) : (
                    <Copy
                      className={`size-3.5 opacity-0 group-hover:opacity-100 ${Number(step) > 400 ? "text-white" : "text-brand-800"}`}
                    />
                  )}
                </span>
                <span className="block text-xs font-semibold">{step}</span>
                <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                  {hex}
                </span>
              </button>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Thành công",
                name: "success",
                style: "border-success/20 bg-success-soft text-success",
                hex: "#16734c",
              },
              {
                label: "Cảnh báo",
                name: "warning",
                style: "border-warning/20 bg-warning-soft text-warning",
                hex: "#926000",
              },
              {
                label: "Nguy hiểm",
                name: "destructive",
                style:
                  "border-destructive/20 bg-destructive-soft text-destructive",
                hex: "#bc3535",
              },
              {
                label: "Thông tin",
                name: "info",
                style: "border-info/20 bg-info-soft text-info",
                hex: "#1b61a8",
              },
            ].map((color) => (
              <div
                key={color.name}
                className={`rounded-control border p-4 ${color.style}`}
              >
                <span className="mb-3 block size-2 rounded-full bg-current" />
                <p className="text-sm font-semibold">{color.label}</p>
                <p className="mt-1 font-mono text-[10px] opacity-85">
                  {color.name} / {color.hex}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Typography</CardTitle>
              <CardDescription>
                Inter variable · Unicode tiếng Việt · thang chữ theo vai trò.
              </CardDescription>
            </div>
            <span className="text-3xl tracking-tight text-subtle-foreground">
              Aa
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                {
                  label: "Display / 32 · 600",
                  text: "Quản lý công việc",
                  style: "text-[32px] leading-10 font-semibold tracking-tight",
                },
                {
                  label: "Heading / 24 · 600",
                  text: "Quản lý công việc",
                  style: "text-2xl leading-8 font-semibold tracking-tight",
                },
                {
                  label: "Title / 18 · 600",
                  text: "Thông tin công việc",
                  style: "text-lg leading-7 font-semibold",
                },
                {
                  label: "Body / 14 · 400",
                  text: "Tra cứu, theo dõi và xử lý công việc công việc.",
                  style: "text-sm leading-6",
                },
                {
                  label: "Caption / 12 · 400",
                  text: "Cập nhật lần cuối · Theo phiên làm việc",
                  style: "text-xs leading-5 text-muted-foreground",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">
                    {item.label}
                  </p>
                  <p className={item.style}>{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Khoảng cách & hình khối</CardTitle>
                <CardDescription>
                  Lưới cơ sở 4px. Control 40px, bảng 56px ở chế độ thoáng.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[4, 8, 12, 16, 24, 32, 48].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="w-9 font-mono text-[10px] text-muted-foreground">
                      {n}px
                    </span>
                    <span
                      className="h-2 rounded-xs bg-primary/70"
                      style={{ width: n * 4 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Control", style: "rounded-control" },
                  { label: "Panel", style: "rounded-panel" },
                  { label: "Pill", style: "rounded-full" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`border border-border bg-background px-3 py-4 text-center text-xs text-muted-foreground ${item.style}`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Chiều sâu</CardTitle>
                <CardDescription>
                  Viền cho cấu trúc. Bóng đổ cho lớp tương tác.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  "border border-border",
                  "shadow-panel",
                  "shadow-floating",
                ].map((s, i) => (
                  <div
                    key={s}
                    className={`rounded-lg bg-surface px-2 py-5 text-center text-xs text-muted-foreground ${s}`}
                  >
                    {["Border", "Panel", "Floating"][i]}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ngôn ngữ biểu tượng</CardTitle>
            <CardDescription>
              Lucide 16–24px, nét 1.5–2px. Icon gốc được giữ ở rail và thống kê.
            </CardDescription>
          </div>
          <Badge>16 / 20 / 24</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              Search,
              FileText,
              FolderOpen,
              Users,
              Building2,
              SlidersHorizontal,
              CalendarDays,
              ShieldCheck,
              Bell,
              CircleHelp,
              ArrowUpRight,
              Trash2,
            ].map((Icon, i) => (
              <span
                key={i}
                className="flex size-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              >
                <Icon className="size-5" strokeWidth={1.7} />
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function ActionsDemo() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nút hành động</CardTitle>
            <CardDescription>
              6 biến thể, 4 kích thước, có icon và trạng thái đang xử lý.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus />
              Tạo công việc
            </Button>
            <Button variant="secondary">
              <Download />
              Xuất dữ liệu
            </Button>
            <Button variant="soft">
              Phân công
              <ArrowRight />
            </Button>
            <Button variant="ghost">Tùy chọn</Button>
            <Button variant="destructive">Xóa công việc</Button>
            <Button variant="link">Xem chi tiết</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Nhỏ · 32</Button>
            <Button>Tiêu chuẩn · 40</Button>
            <Button size="lg">Lớn · 44</Button>
            <Tooltip content="Thao tác khác">
              <Button
                variant="secondary"
                size="icon"
                aria-label="Thao tác khác"
              >
                <MoreHorizontal />
              </Button>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button loading>Đang lưu</Button>
            <Button disabled>Chưa khả dụng</Button>
            <Button variant="secondary" disabled>
              Không có quyền
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nhãn & trạng thái</CardTitle>
              <CardDescription>
                Màu đi cùng nội dung, luôn đọc được khi không phân biệt màu.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge dot>Mới tạo</Badge>
              <Badge dot variant="brand">
                Đang thực hiện
              </Badge>
              <Badge dot variant="success">
                Hoàn thành
              </Badge>
              <Badge dot variant="warning">
                Chờ xử lý
              </Badge>
              <Badge dot variant="danger">
                Quá hạn
              </Badge>
              <Badge dot variant="info">
                Liên thông
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Avatar & tooltip</CardTitle>
              <CardDescription>
                Ảnh, chữ viết tắt và gợi ý khi rê chuột hoặc focus.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-5">
            <div className="flex -space-x-2">
              <Avatar fallback="CH" alt="Chấp hành viên" />
              <Avatar fallback="TK" alt="Thư ký" />
              <Avatar fallback="KT" alt="Kiểm tra viên" />
              <Avatar
                fallback="+3"
                alt="Ba người khác"
                className="bg-muted text-muted-foreground"
              />
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Tooltip content="Chỉ xuất những bản ghi đang được lọc.">
              <Button variant="secondary" size="sm">
                <CircleHelp />
                Thông tin xuất dữ liệu
              </Button>
            </Tooltip>
          </CardContent>
        </Card>
      </div>
      <div className="xl:col-span-2">
        <Alert title="Quy tắc sử dụng thao tác" tone="info">
          Mỗi vùng công việc ưu tiên một hành động chính. Dùng nút phụ cho thao
          tác bổ sung; hành động xóa cần bước xác nhận.
        </Alert>
      </div>
    </div>
  );
}
