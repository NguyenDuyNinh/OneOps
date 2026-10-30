"use client";
import { useId, useState } from "react";
import { Save } from "lucide-react";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/core/ui/design-system/ui/primitives/foundations";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import {
  Checkbox,
  Field,
  FileUpload,
  Input,
  Label,
  RadioGroup,
  RadioItem,
  SearchInput,
  Select,
  Slider,
  Switch,
  Textarea,
} from "@/core/ui/design-system/ui/primitives/forms";
import {
  Combobox,
  MultiSelect,
} from "@/core/ui/design-system/ui/primitives/combobox";
import { useWorkspace } from "@/core/ui/design-system/ui/primitives/workspace";

export function FormsDemo() {
  const id = useId();
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [channel, setChannel] = useState("internal");
  const [days, setDays] = useState([15]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Trường nhập liệu</CardTitle>
              <CardDescription>
                Nhãn ở trên, hướng dẫn ở dưới, lỗi được liên kết với trường.
              </CardDescription>
            </div>
            <Badge>Input states</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field
              label="Mã công việc"
              hint="Nhập mã định danh công việc."
              required
            >
              {(p) => <Input {...p} placeholder="VD: TASK-001" />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngày ban hành">
                {(p) => <Input {...p} type="date" />}
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
            <Field
              label="Mã công việc"
              error="Mã công việc đã tồn tại. Vui lòng kiểm tra lại."
            >
              {(p) => <Input {...p} defaultValue="HS-MINH-HOA" />}
            </Field>
            <Field
              label="Đơn vị quản lý"
              hint="Trường được tự động xác định từ tài khoản."
            >
              {(p) => (
                <Input {...p} value="Đơn vị minh họa" disabled readOnly />
              )}
            </Field>
            <Field
              label="Trích yếu nội dung"
              hint="Tối đa 500 ký tự. Nội dung không bao gồm dữ liệu cá nhân nhạy cảm."
            >
              {(p) => (
                <Textarea
                  {...p}
                  placeholder="Nhập nội dung tóm tắt…"
                  maxLength={500}
                />
              )}
            </Field>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Chọn có tìm kiếm</CardTitle>
                <CardDescription>
                  Tìm nhanh trong danh mục dài và chọn nhiều giá trị.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field label="Đơn vị minh họa">
                {(p) => (
                  <Combobox
                    {...p}
                    options={[
                      "Đơn vị minh họa 01",
                      "Đơn vị minh họa 02",
                      "Đơn vị minh họa 03",
                    ]}
                    value={selectedAgency}
                    onValueChange={setSelectedAgency}
                    placeholder="Chọn một đơn vị"
                  />
                )}
              </Field>
              <Field label="Nhóm công việc minh họa">
                {(p) => (
                  <MultiSelect
                    {...p}
                    options={[
                      "Sản phẩm",
                      "Vận hành",
                      "Marketing",
                      "Nhân sự",
                      "Kinh doanh",
                      "Hôn nhân và gia đình",
                    ]}
                    value={selectedKinds}
                    onValueChange={setSelectedKinds}
                    placeholder="Chọn một hoặc nhiều nhóm công việc"
                  />
                )}
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Lựa chọn & tùy chỉnh</CardTitle>
                <CardDescription>
                  Vùng nhấn có nhãn, thao tác được bằng Space và phím mũi tên.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`${id}-check`}
                    checked={checked}
                    onCheckedChange={(v) => setChecked(v === true)}
                  />
                  <Label htmlFor={`${id}-check`}>
                    Chọn công việc để phân công
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`${id}-partial`}
                    checked="indeterminate"
                    aria-label="Lựa chọn một phần"
                  />
                  <Label htmlFor={`${id}-partial`}>Đã chọn một phần</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id={`${id}-disabled`} disabled />
                  <Label
                    htmlFor={`${id}-disabled`}
                    className="text-subtle-foreground"
                  >
                    Chưa được cấp quyền
                  </Label>
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-3 text-sm font-medium">Kênh gửi thông báo</p>
                <RadioGroup
                  value={channel}
                  onValueChange={setChannel}
                  aria-label="Kênh gửi thông báo"
                >
                  <div className="flex items-center gap-3">
                    <RadioItem id={`${id}-internal`} value="internal" />
                    <Label htmlFor={`${id}-internal`}>Thông báo nội bộ</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioItem id={`${id}-vneid`} value="vneid" />
                    <Label htmlFor={`${id}-vneid`}>Thông báo VNeID</Label>
                  </div>
                </RadioGroup>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={`${id}-notify`}>Nhắc việc tự động</Label>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Nhận nhắc việc trước hạn xử lý công việc.
                  </p>
                </div>
                <Switch
                  id={`${id}-notify`}
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label htmlFor={`${id}-days`}>Thời gian nhắc trước</Label>
                  <Badge>{days[0]} ngày</Badge>
                </div>
                <Slider
                  id={`${id}-days`}
                  aria-label="Thời gian nhắc trước"
                  value={days}
                  onValueChange={setDays}
                  min={1}
                  max={30}
                  step={1}
                  disabled={!notifications}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Tìm kiếm</CardTitle>
                <CardDescription>
                  Xóa nhanh từ khóa, hỗ trợ nội dung tiếng Việt.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Tìm số công việc, dự án, người liên quan…"
                label="Tìm kiếm minh họa"
              />
              {search && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Từ khóa đang nhập:{" "}
                  <strong className="text-foreground">{search}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Tệp đính kèm</CardTitle>
            <CardDescription>
              Chọn nhiều tệp, kéo thả, kiểm tra loại và dung lượng, gỡ từng tệp.
            </CardDescription>
          </div>
          <Badge variant="info">Chọn cục bộ</Badge>
        </CardHeader>
        <CardContent>
          <FileUpload />
        </CardContent>
      </Card>
    </div>
  );
}

export function CreateFormPattern() {
  const { notify } = useWorkspace();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    code?: string;
    name?: string;
    date?: string;
  }>({});
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tiếp nhận công việc</CardTitle>
          <CardDescription>
            Mẫu tương tác minh họa · Không tạo công việc nghiệp vụ.
          </CardDescription>
        </div>
        <Badge variant="brand">Biểu mẫu</Badge>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = {
              date: String(fd.get("date") || "").trim()
                ? undefined
                : "Vui lòng chọn ngày tiếp nhận.",
              code: String(fd.get("code") || "").trim()
                ? undefined
                : "Vui lòng nhập mã công việc.",
              name: String(fd.get("name") || "").trim()
                ? undefined
                : "Vui lòng nhập trích yếu nội dung.",
            };
            setErrors(next);
            if (next.code || next.name || next.date) return;
            setSubmitted(true);
            notify(
              "Đã kiểm tra biểu mẫu minh họa. Không gửi dữ liệu lên máy chủ.",
            );
          }}
          className="space-y-5"
        >
          {submitted && (
            <Alert tone="success" title="Biểu mẫu hợp lệ">
              Các trường bắt buộc đã được kiểm tra.
            </Alert>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mã công việc" required error={errors.code}>
              {(p) => (
                <Input
                  {...p}
                  name="code"
                  required
                  placeholder="Nhập mã công việc"
                />
              )}
            </Field>
            <Field label="Ngày tiếp nhận" required error={errors.date}>
              {(p) => <Input {...p} name="date" type="date" required />}
            </Field>
          </div>
          <Field label="Trích yếu nội dung" required error={errors.name}>
            {(p) => (
              <Textarea
                {...p}
                name="name"
                required
                placeholder="Tóm tắt nội dung công việc…"
              />
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Loại công việc">
              {(p) => (
                <Select {...p} name="kind">
                  <option>Công việc nội bộ</option>
                  <option>Công việc khách hàng</option>
                </Select>
              )}
            </Field>
            <Field label="Ngày hẹn xử lý">
              {(p) => <Input {...p} type="date" name="due" />}
            </Field>
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
            <Button
              variant="secondary"
              type="reset"
              onClick={() => {
                setErrors({});
                setSubmitted(false);
              }}
            >
              Nhập lại
            </Button>
            <Button type="submit">
              <Save />
              Kiểm tra & lưu thử
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
