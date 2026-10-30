"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Save,
  Send,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Stepper,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Timeline,
} from "@/core/ui/design-system/ui/primitives/navigation";
import {
  Alert,
  Badge,
  Breadcrumb,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Pagination,
  Progress,
  Separator,
  Skeleton,
  Spinner,
} from "@/core/ui/design-system/ui/primitives/foundations";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import {
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/core/ui/design-system/ui/primitives/overlays";
import {
  Field,
  Input,
  Select,
  Slider,
} from "@/core/ui/design-system/ui/primitives/forms";
import { useWorkspace } from "@/core/ui/design-system/ui/primitives/workspace";

export function NavigationDemo() {
  const [page, setPage] = useState(1);
  const [step, setStep] = useState(1);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Đường dẫn & tabs</CardTitle>
            <CardDescription>
              Phản ánh vị trí và nhóm nội dung hiện tại.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/home" },
              { label: "Cá nhân", href: "/tasks" },
              { label: "Chi tiết công việc" },
            ]}
          />
          <Tabs defaultValue="profile">
            <TabsList aria-label="Nhóm thông tin minh họa">
              <TabsTrigger value="profile">
                <FileText className="size-4" />
                Thông tin công việc
              </TabsTrigger>
              <TabsTrigger value="documents">
                Tài liệu <Badge className="ml-1 text-[10px]">04</Badge>
              </TabsTrigger>
              <TabsTrigger value="activity">Lịch sử xử lý</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="rounded-control border border-border bg-background p-5">
                <p className="text-sm font-medium">Thông tin chung</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Mã công việc, trạng thái và người phụ trách được nhóm trong
                  cùng một khu vực để dễ đối chiếu.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <EmptyState
                title="Tài liệu của công việc"
                description="Vùng minh họa cho tài liệu theo ngữ cảnh công việc."
                icon={<FileText className="size-6" />}
              />
            </TabsContent>
            <TabsContent value="activity">
              <Timeline
                items={[
                  {
                    title: "Tiếp nhận công việc",
                    description: "Công việc được tạo và kiểm tra thông tin.",
                    time: "08:30",
                    complete: true,
                  },
                  {
                    title: "Phân công xử lý",
                    description: "Chuyển đến người phụ trách.",
                    time: "09:15",
                    complete: true,
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>
                Mở rộng khi cần, giữ trọng tâm cho thông tin chính.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="a">
              <AccordionItem value="a">
                <AccordionTrigger>Thông tin công việc</AccordionTrigger>
                <AccordionContent>
                  Bao gồm mã công việc, cơ quan ban hành, ngày ban hành và căn
                  cứ tiếp nhận công việc.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Thông tin người liên quan</AccordionTrigger>
                <AccordionContent>
                  Thông tin định danh và liên hệ được hiển thị theo quyền truy
                  cập.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>Tài nguyên và tiến độ</AccordionTrigger>
                <AccordionContent>
                  Nhóm tài sản, giá trị và tiến độ thực hiện kế hoạch của công
                  việc.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Phân trang</CardTitle>
              <CardDescription>
                Trạng thái hiện tại, dấu rút gọn và giới hạn trang đầu/cuối.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-44 flex-col items-center justify-center gap-6 rounded-control border border-border bg-background">
              <p className="text-sm text-muted-foreground">
                Đang ở trang <strong className="text-foreground">{page}</strong>{" "}
                trên 12
              </p>
              <Pagination page={page} totalPages={12} onChange={setPage} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quy trình nhiều bước</CardTitle>
            <CardDescription>
              Bước hiện tại có nhãn. Cho phép quay lại bước đã hoàn tất.
            </CardDescription>
          </div>
          <Badge variant="info">Bước {step + 1} / 4</Badge>
        </CardHeader>
        <CardContent>
          <Stepper
            steps={["Tiếp nhận", "Kiểm tra", "Phân công", "Hoàn tất"]}
            current={step}
            onStepChange={setStep}
          />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-control border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              {
                [
                  "Nhập thông tin và đính kèm tài liệu.",
                  "Kiểm tra thông tin công việc và tài liệu.",
                  "Chỉ định người phụ trách công việc.",
                  "Quy trình minh họa đã hoàn tất.",
                ][step]
              }
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Quay lại
              </Button>
              <Button
                size="sm"
                disabled={step === 3}
                onClick={() => setStep(step + 1)}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeedbackDemo() {
  const { notify } = useWorkspace();
  const [progress, setProgress] = useState([65]);
  const [retry, setRetry] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Alert tone="info" title="Thông tin liên thông">
          Văn bản mới sẽ hiển thị sau khi hoàn tất đồng bộ dữ liệu.
        </Alert>
        <Alert tone="success" title="Đã lưu thay đổi">
          Thông tin công việc được cập nhật thành công.
        </Alert>
        <Alert tone="warning" title="Công việc sắp đến hạn">
          Kiểm tra công việc cần xử lý để bảo đảm tiến độ.
        </Alert>
        <Alert tone="danger" title="Không thể tải danh sách">
          Vui lòng kiểm tra kết nối và thử lại.
        </Alert>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tiến độ & thông báo</CardTitle>
              <CardDescription>
                Có mô tả bằng chữ bên cạnh tín hiệu trực quan.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-3 flex justify-between text-sm">
                <span>Hoàn thiện công việc</span>
                <strong>{progress[0]}%</strong>
              </div>
              <Progress
                value={progress[0]}
                label="Mức độ hoàn thiện công việc"
              />
              <Slider
                className="mt-4"
                aria-label="Điều chỉnh tiến độ minh họa"
                value={progress}
                onValueChange={setProgress}
                min={0}
                max={100}
              />
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-4">
              <Spinner />
              <span className="text-sm text-muted-foreground">
                Đang đồng bộ dữ liệu…
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => notify("Đã lưu thay đổi minh họa thành công.")}
            >
              <Bell />
              Hiển thị thông báo
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>
                Giữ bố cục ổn định trong thời gian chờ dữ liệu.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div
              role="status"
              aria-label="Đang tải thông tin"
              className="space-y-5"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <EmptyState
            title="Chưa có công việc lưu trữ"
            description="Công việc hoàn tất sẽ được hiển thị tại đây sau khi lưu trữ."
            action={
              <Button variant="secondary" asChild>
                <Link href="/notes">
                  <Eye />
                  Xem phân hệ lưu trữ
                </Link>
              </Button>
            }
          />
        </Card>
        <Card>
          <EmptyState
            title={retry ? "Đã thử lại thành công" : "Không thể tải dữ liệu"}
            description={
              retry
                ? "Đây là trạng thái phục hồi minh họa."
                : "Kết nối tạm thời bị gián đoạn. Bạn có thể thử tải lại."
            }
            icon={
              retry ? (
                <CheckCircle2 className="size-6 text-success" />
              ) : (
                <X className="size-6 text-destructive" />
              )
            }
            action={
              <Button variant="secondary" onClick={() => setRetry(!retry)}>
                {retry ? "Đặt lại minh họa" : "Thử lại"}
              </Button>
            }
          />
        </Card>
      </div>
    </div>
  );
}

export function OverlaysDemo() {
  const { notify } = useWorkspace();
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Dialog & xác nhận</CardTitle>
            <CardDescription>
              Giữ focus trong hộp thoại, Escape để đóng, trả focus về nút mở.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Pencil />
                Mở hộp thoại
              </Button>
            </DialogTrigger>
            <DialogContent
              title="Cập nhật thông tin"
              description="Ví dụ hộp thoại chỉnh sửa nội dung công việc."
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  notify("Đã lưu nội dung minh họa.");
                  setOpen(false);
                }}
              >
                <div className="space-y-5 p-6">
                  <Field label="Tên hiển thị" required>
                    {(p) => (
                      <Input
                        {...p}
                        defaultValue="Công việc minh họa"
                        required
                      />
                    )}
                  </Field>
                  <Field label="Trạng thái">
                    {(p) => (
                      <Select {...p}>
                        <option>Đang thực hiện</option>
                        <option>Hoãn</option>
                        <option>Hoàn thành</option>
                      </Select>
                    )}
                  </Field>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Hủy</Button>
                  </DialogClose>
                  <Button type="submit">
                    <Save />
                    Lưu thay đổi
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            trigger={
              <Button variant="destructive">
                <Trash2 />
                Xác nhận xóa
              </Button>
            }
            title="Xóa công việc minh họa?"
            description="Thao tác này chỉ minh họa bước xác nhận. Không có dữ liệu nghiệp vụ nào bị xóa."
            confirmLabel="Xóa bản minh họa"
            destructive
            onConfirm={() => notify("Đã xác nhận xóa trong minh họa.")}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Panel chi tiết</CardTitle>
            <CardDescription>
              Mở bên phải, phù hợp tra cứu mà vẫn giữ ngữ cảnh danh sách.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <FileText />
                Mở panel chi tiết
              </Button>
            </DialogTrigger>
            <DialogContent
              sheet
              title="Công việc minh họa"
              description="Thông tin chi tiết và lịch sử xử lý."
            >
              <div className="space-y-6 p-6">
                <Badge dot variant="brand">
                  Đang thực hiện
                </Badge>
                <dl className="grid grid-cols-2 gap-5 text-sm">
                  {[
                    ["Mã công việc", "CV-MH-001"],
                    ["Ngày tiếp nhận", "29/10/2026"],
                    ["Phân hệ", "Cá nhân"],
                    ["Người phụ trách", "Chưa phân công"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1.5 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Separator />
                <Timeline
                  items={[
                    {
                      title: "Tiếp nhận công việc",
                      description: "Hoàn tất kiểm tra dữ liệu đầu vào.",
                      time: "08:30",
                      complete: true,
                    },
                    {
                      title: "Đang xử lý",
                      description: "Chờ phân công người phụ trách.",
                      time: "09:15",
                    },
                  ]}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Đóng panel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Menu ngữ cảnh</CardTitle>
            <CardDescription>
              Di chuyển bằng phím mũi tên, Enter để chọn thao tác.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <MoreHorizontal />
                Thao tác công việc
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={() => notify("Đã chọn xem chi tiết minh họa.")}
              >
                <Eye />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => notify("Đã chọn chỉnh sửa minh họa.")}
              >
                <Pencil />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => notify("Đã chọn sao chép minh họa.")}
              >
                <Copy />
                Nhân bản công việc
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Send />
                Chuyển tiếp · chưa có quyền
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() =>
                  notify("Thao tác xóa cần được xác nhận trong luồng thực tế.")
                }
              >
                <Trash2 />
                Xóa công việc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Bộ lọc theo ngữ cảnh</CardTitle>
            <CardDescription>
              Popover cho điều kiện ngắn, dialog cho bộ lọc nhiều trường.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <SlidersHorizontal />
                Lọc nhanh
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  notify("Đã kiểm tra điều kiện lọc minh họa.");
                }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm font-semibold">Điều kiện hiển thị</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ví dụ thiết lập lọc theo trạng thái.
                  </p>
                </div>
                <Field label="Trạng thái">
                  {(p) => (
                    <Select {...p}>
                      <option>Tất cả</option>
                      <option>Đang thực hiện</option>
                      <option>Hoàn thành</option>
                    </Select>
                  )}
                </Field>
                <div className="flex justify-end gap-2">
                  <PopoverClose asChild>
                    <Button variant="secondary" size="sm">
                      Đóng
                    </Button>
                  </PopoverClose>
                  <Button type="submit" size="sm">
                    Áp dụng thử
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
}
