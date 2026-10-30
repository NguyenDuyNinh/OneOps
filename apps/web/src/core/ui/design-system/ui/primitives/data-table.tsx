"use client";
import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  ListFilter,
} from "lucide-react";
import { cn } from "@/core/ui/design-system/lib/utils";
import { Button } from "@/core/ui/design-system/ui/primitives/button";
import {
  Checkbox,
  SearchInput,
  Select,
} from "@/core/ui/design-system/ui/primitives/forms";
import {
  EmptyState,
  Pagination,
} from "@/core/ui/design-system/ui/primitives/foundations";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/core/ui/design-system/ui/primitives/overlays";

export type DataColumn<T> = {
  id: string;
  label: string;
  accessor: (row: T) => string | number;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Tìm trong bảng…",
  caption = "Danh sách dữ liệu",
  actions,
}: {
  data: T[];
  columns: DataColumn<T>[];
  searchPlaceholder?: string;
  caption?: string;
  actions?: (row: T) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const filtered = data.filter((row) =>
    columns.some((col) =>
      String(col.accessor(row))
        .toLocaleLowerCase("vi")
        .includes(search.trim().toLocaleLowerCase("vi")),
    ),
  );
  const sortColumn = columns.find((col) => col.id === sort?.id);
  if (sortColumn)
    filtered.sort((a, b) => {
      const av = sortColumn.accessor(a),
        bv = sortColumn.accessor(b);
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "vi");
      return sort?.desc ? -result : result;
    });
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * size, current * size);
  const visible = columns.filter((col) => !hidden.includes(col.id));
  const selectedCount = filtered.filter((r) => selected.includes(r.id)).length;
  function exportRows() {
    const items = selectedCount
      ? filtered.filter((row) => selected.includes(row.id))
      : filtered;
    const escape = (value: string | number) => {
      const s = String(value);
      return `"${/^[=+@\-\t\r]/.test(s) ? "'" : ""}${s.replaceAll('"', '""')}"`;
    };
    const csv =
      "\uFEFF" +
      [
        visible.map((col) => col.label),
        ...items.map((row) => visible.map((col) => col.accessor(row))),
      ]
        .map((row) => row.map(escape).join(","))
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "bang-du-lieu.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="overflow-hidden rounded-panel border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <SearchInput
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Tìm kiếm trong bảng"
          placeholder={searchPlaceholder}
          className="w-full sm:max-w-72"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <Columns3 />
                Cột hiển thị
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={!hidden.includes(col.id)}
                  disabled={!hidden.includes(col.id) && visible.length === 1}
                  onCheckedChange={(checked) =>
                    setHidden(
                      checked
                        ? hidden.filter((id) => id !== col.id)
                        : [...hidden, col.id],
                    )
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="secondary"
            size="sm"
            disabled={!filtered.length}
            onClick={exportRows}
          >
            <Download />
            {selectedCount ? `Xuất ${selectedCount} đã chọn` : "Xuất CSV"}
          </Button>
        </div>
      </div>
      {selectedCount > 0 && (
        <div className="flex items-center justify-between border-b border-border bg-accent px-4 py-2 text-xs text-accent-foreground">
          <span>
            Đã chọn {selectedCount} / {filtered.length} bản ghi
          </span>
          <Button variant="link" size="sm" onClick={() => setSelected([])}>
            Bỏ chọn
          </Button>
        </div>
      )}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="h-11 w-12 px-4">
                <Checkbox
                  aria-label="Chọn tất cả hàng trên trang"
                  checked={
                    rows.length > 0 &&
                    rows.every((r) => selected.includes(r.id))
                      ? true
                      : rows.some((r) => selected.includes(r.id))
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked
                        ? Array.from(
                            new Set([...selected, ...rows.map((r) => r.id)]),
                          )
                        : selected.filter(
                            (id) => !rows.some((r) => r.id === id),
                          ),
                    )
                  }
                />
              </th>
              {visible.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    sort?.id === col.id
                      ? sort.desc
                        ? "descending"
                        : "ascending"
                      : undefined
                  }
                  className={cn(
                    "h-11 bg-background px-4 py-2 text-xs font-medium text-muted-foreground",
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-2 rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => {
                        setSort({
                          id: col.id,
                          desc: sort?.id === col.id ? !sort.desc : false,
                        });
                        setPage(1);
                      }}
                    >
                      {col.label}
                      {sort?.id === col.id ? (
                        sort.desc ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUp className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 text-subtle-foreground" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions && (
                <th scope="col" className="w-12 bg-background px-4">
                  <span className="sr-only">Thao tác</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-background",
                  selected.includes(row.id) && "bg-accent/60",
                )}
              >
                <td className="h-[var(--row-height)] px-4 py-3">
                  <Checkbox
                    aria-label={`Chọn hàng ${row.id}`}
                    checked={selected.includes(row.id)}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? [...selected, row.id]
                          : selected.filter((id) => id !== row.id),
                      )
                    }
                  />
                </td>
                {visible.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "h-[var(--row-height)] px-4 py-3 text-sm text-foreground",
                      col.className,
                    )}
                  >
                    {col.cell ? col.cell(row) : col.accessor(row)}
                  </td>
                ))}
                {actions && <td className="px-4 py-3">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <EmptyState
          icon={<ListFilter className="size-6" />}
          title="Không tìm thấy dữ liệu"
          description="Thay đổi từ khóa tìm kiếm hoặc đặt lại điều kiện."
          action={
            <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
              Đặt lại tìm kiếm
            </Button>
          }
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-xs text-muted-foreground">
        <span>
          {filtered.length
            ? `${(current - 1) * size + 1}–${Math.min(current * size, filtered.length)} trên ${filtered.length}`
            : "0 bản ghi"}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            Mỗi trang
            <Select
              aria-label="Số hàng mỗi trang"
              className="h-8 w-16 py-1 text-xs"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </Select>
          </label>
          <Pagination page={current} totalPages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
