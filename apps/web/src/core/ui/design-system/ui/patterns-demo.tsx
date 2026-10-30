"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  MoreHorizontal,
  RotateCcw,
  ShieldCheck,
  UserRound,
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
  Progress,
  Separator,
} from "@/core/ui/design-system/ui/primitives/foundations";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import {
  DataTable,
  type DataColumn,
} from "@/core/ui/design-system/ui/primitives/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/ui/design-system/ui/primitives/overlays";
import {
  Stepper,
  Timeline,
} from "@/core/ui/design-system/ui/primitives/navigation";
import { CreateFormPattern } from "@/core/ui/design-system/ui/forms-demo";
type DemoRow = {
  id: string;
  code: string;
  name: string;
  date: string;
  status: "Đang thực hiện" | "Chờ phân công" | "Hoàn thành" | "Tạm dừng";
  owner: string;
};
const sampleRows: DemoRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `MH-${String(i + 1).padStart(3, "0")}`,
  code: `CV-MH-${String(i + 1).padStart(3, "0")}`,
  name: `Công việc minh họa ${String(i + 1).padStart(2, "0")}`,
  date: `${String(29 - i).padStart(2, "0")}/10/2026`,
  status: (
    ["Đang thực hiện", "Chờ phân công", "Hoàn thành", "Tạm dừng"] as const
  )[i % 4],
  owner: i % 3 === 0 ? "Chưa phân công" : `Nhóm xử lý ${(i % 2) + 1}`,
}));
const statusVariants = {
  "Đang thực hiện": "brand",
  "Chờ phân công": "warning",
  "Hoàn thành": "success",
  "Tạm dừng": "neutral",
} as const;
export function DataDemo() {
  const [detail, setDetail] = useState<DemoRow | null>(null);
  const columns: DataColumn<DemoRow>[] = [
    {
      id: "code",
      label: "Mã công việc",
      accessor: (r) => r.code,
      sortable: true,
      cell: (r) => (
        <button
          className="font-medium text-info hover:underline"
          onClick={() => setDetail(r)}
        >
          {r.code}
        </button>
      ),
    },
    {
      id: "name",
      label: "Nội dung công việc",
      accessor: (r) => r.name,
      sortable: true,
    },
    {
      id: "date",
      label: "Ngày tiếp nhận",
      accessor: (r) => r.date,
      sortable: true,
    },
    {
      id: "status",
      label: "Trạng thái",
      accessor: (r) => r.status,
      cell: (r) => (
        <Badge variant={statusVariants[r.status]} dot>
          {r.status}
        </Badge>
      ),
    },
    {
      id: "owner",
      label: "Người phụ trách",
      accessor: (r) => r.owner,
      cell: (r) => (
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <UserRound className="size-3.5" />
          {r.owner}
        </span>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng công việc",
            value: 8,
            icon: FileText,
            caption: "Trong bảng minh họa",
            tone: "text-info bg-info-soft",
          },
          {
            label: "Đang thực hiện",
            value: 2,
            icon: Clock3,
            caption: "Đang được xử lý",
            tone: "text-accent-foreground bg-accent",
          },
          {
            label: "Đã hoàn thành",
            value: 2,
            icon: CheckCircle2,
            caption: "Đã hoàn thành công việc",
            tone: "text-success bg-success-soft",
          },
          {
            label: "Chờ phân công",
            value: 2,
            icon: UserRound,
            caption: "Cần người phụ trách",
            tone: "text-warning bg-warning-soft",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${item.tone}`}
                >
                  <item.icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {String(item.value).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs text-subtle-foreground">
                {item.caption}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Danh sách công việc</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Dữ liệu minh họa · Tìm kiếm, sắp xếp và xuất CSV hoạt động trên bảng
            này.
          </p>
        </div>
        <Badge variant="info">8 bản ghi minh họa</Badge>
      </div>
      <DataTable
        data={sampleRows}
        columns={columns}
        searchPlaceholder="Tìm mã, nội dung hoặc trạng thái…"
        caption="Bảng công việc minh họa"
        actions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 px-0"
                aria-label={`Thao tác ${row.id}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDetail(row)}>
                <FileText />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent
          sheet
          title={detail?.name || "Chi tiết công việc"}
          description="Nội dung minh họa của hàng đã chọn."
        >
          {detail && (
            <div className="space-y-6 p-6">
              <Badge variant={statusVariants[detail.status]} dot>
                {detail.status}
              </Badge>
              <dl className="space-y-5">
                {[
                  ["Mã công việc", detail.code],
                  ["Ngày tiếp nhận", detail.date],
                  ["Người phụ trách", detail.owner],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1.5 text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <Separator />
              <Alert title="Dữ liệu minh họa">
                Thông tin trong thư viện không liên kết với công việc nghiệp vụ.
              </Alert>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function PatternsDemo() {
  const [approval, setApproval] = useState(0);
  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <CreateFormPattern />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Kiểm tra & phê duyệt</CardTitle>
              <CardDescription>
                Ghép trạng thái, checklist, tiến độ và hành động theo bước.
              </CardDescription>
            </div>
            <Badge variant={approval === 2 ? "success" : "warning"}>
              {["Chờ kiểm tra", "Đã kiểm tra", "Đã duyệt"][approval]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 rounded-control border border-border bg-background p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">CV-MH-001</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Luồng phê duyệt minh họa
                </p>
              </div>
            </div>
            <Stepper
              steps={["Tiếp nhận", "Kiểm tra", "Duyệt"]}
              current={approval}
            />
            <div className="space-y-3">
              {[
                "Đủ thông tin công việc",
                "Tài liệu đính kèm hợp lệ",
                "Đã xác định người phụ trách",
              ].map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`size-4 ${approval > 0 || i === 0 ? "text-success" : "text-subtle-foreground"}`}
                  />
                  {label}
                </div>
              ))}
            </div>
            <Progress
              value={approval === 2 ? 100 : approval === 1 ? 66 : 33}
              label="Tiến độ phê duyệt minh họa"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setApproval(0)}>
                <RotateCcw />
                Đặt lại
              </Button>
              <Button
                size="sm"
                disabled={approval === 2}
                onClick={() => setApproval(approval + 1)}
              >
                <CheckCircle2 />
                {approval === 0
                  ? "Xác nhận kiểm tra"
                  : approval === 1
                    ? "Phê duyệt thử"
                    : "Đã hoàn tất"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nhật ký xử lý</CardTitle>
              <CardDescription>
                Thông tin theo thời gian, luôn đi cùng người và hành động.
              </CardDescription>
            </div>
            <div className="flex -space-x-2">
              <Avatar
                alt="Người tiếp nhận minh họa"
                fallback="TN"
                className="size-8"
              />
              <Avatar
                alt="Người kiểm tra minh họa"
                fallback="KT"
                className="size-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Timeline
              items={[
                {
                  title: "Tiếp nhận công việc",
                  description:
                    "Nhóm tiếp nhận kiểm tra yêu cầu và tài liệu kèm theo.",
                  time: "08:30 · 29/10",
                  complete: true,
                },
                {
                  title: "Kiểm tra thông tin",
                  description:
                    "Đối chiếu mã công việc và tình trạng công việc.",
                  time: "09:15 · 29/10",
                  complete: approval > 0,
                },
                {
                  title: approval === 2 ? "Đã phê duyệt" : "Chờ phê duyệt",
                  description:
                    approval === 2
                      ? "Luồng minh họa đã hoàn tất."
                      : "Người có thẩm quyền xem xét và xác nhận.",
                  time: approval === 2 ? "Hoàn tất" : "Đang chờ",
                  complete: approval === 2,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
