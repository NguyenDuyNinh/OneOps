#!/usr/bin/env node
/**
 * Báo cáo "drift" của UI: bản copy trong từng module lệch bao nhiêu so với bộ mẫu.
 *
 * Vì sao cần: mỗi module sở hữu `<module>/ui/` riêng (copy từ `features/_template/ui`)
 * để 17 người không conflict. Cái giá là các bản copy có thể lệch nhau dần — "style trôi".
 * Script này KHÔNG chặn gì cả; nó chỉ làm cho sự lệch trở nên **nhìn thấy được**.
 *
 * Cách đọc kết quả:
 *   identical  → bản copy vẫn khớp mẫu
 *   diverged   → đã sửa riêng. Bình thường, NHƯNG nếu cùng một component bị lệch ở
 *                ≥3 module vì cùng một lý do → đó là tín hiệu phải đưa khác biệt đó lên
 *                `@theme` trong `apps/web/src/app/globals.css` (token dùng chung),
 *                rồi cập nhật `_template/ui` để mọi module cùng hưởng.
 *
 * Chạy: `pnpm ui:drift`  (thêm `--strict` để exit 1 khi có bản lệch — dùng khi muốn CI chặn)
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FEATURES = join(ROOT, "apps", "web", "src", "features");
const TEMPLATE = join(FEATURES, "_template", "ui");
const STRICT = process.argv.includes("--strict");

/**
 * Chuẩn hoá nội dung để so sánh "phần thân" component:
 * bỏ comment dòng đầu, bỏ import, bỏ dòng trống → chỉ còn JSX + logic.
 * @param {string} text
 */
function normalize(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("//"))
    .filter((line) => !line.startsWith("import "))
    .filter((line) => !line.startsWith('"use client"') && !line.startsWith("'use client'"));
}

/** Số dòng thêm/xoá theo LCS — đủ chính xác cho file component nhỏ. */
function diffCount(a, b) {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return { added: m, removed: n };
  // LCS bằng 1 hàng (rolling) để không tốn O(n*m) bộ nhớ.
  let prev = new Int32Array(m + 1);
  let cur = new Int32Array(m + 1);
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  const lcs = prev[m];
  return { added: m - lcs, removed: n - lcs };
}

function listFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listFiles(full, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(full);
  }
  return acc;
}

/** Tên file trong module → tên file tương ứng trong bộ mẫu (khi bộ mẫu đặt trong thư mục). */
const TEMPLATE_ALIASES = { "Modal.tsx": "modal/index.tsx", "Table.tsx": "table/index.tsx" };

/** basename → đường dẫn trong bộ mẫu (bỏ qua tên trùng như `index.tsx`). */
const byBasename = new Map();
for (const file of listFiles(TEMPLATE)) {
  const name = basename(file);
  if (byBasename.has(name)) byBasename.set(name, null); // trùng tên → không so được
  else byBasename.set(name, file);
}
for (const [from, to] of Object.entries(TEMPLATE_ALIASES)) {
  const target = join(TEMPLATE, to);
  if (existsSync(target)) byBasename.set(from, target);
}

/** Mọi thư mục `<module>/ui` (một hoặc hai cấp dưới `features/`). */
function findUiDirs(dir, depth, acc) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_") || name === "node_modules") continue;
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name === "ui") {
      acc.push(full);
      continue;
    }
    if (depth > 0) findUiDirs(full, depth - 1, acc);
  }
  return acc;
}

const uiDirs = findUiDirs(FEATURES, 2, []);
/** @type {{component: string, module: string, status: string, added: number, removed: number}[]} */
const rows = [];

for (const uiDir of uiDirs) {
  const module = relative(FEATURES, dirname(uiDir)).split("/").join("/");
  for (const file of listFiles(uiDir)) {
    const name = basename(file);
    const templateFile = byBasename.get(name);
    if (templateFile === undefined) {
      rows.push({ component: name, module, status: "no-template", added: 0, removed: 0 });
      continue;
    }
    if (templateFile === null) {
      rows.push({ component: name, module, status: "ambiguous", added: 0, removed: 0 });
      continue;
    }
    const { added, removed } = diffCount(
      normalize(readFileSync(templateFile, "utf8")),
      normalize(readFileSync(file, "utf8")),
    );
    rows.push({
      component: name,
      module,
      status: added === 0 && removed === 0 ? "identical" : "diverged",
      added,
      removed,
    });
  }
}

rows.sort((a, b) => a.component.localeCompare(b.component) || a.module.localeCompare(b.module));

const ICON = {
  identical: "  =",
  diverged: "  ~",
  "no-template": "  ?",
  ambiguous: "  ?",
};
const LABEL = {
  identical: "giống bộ mẫu",
  diverged: "đã sửa riêng",
  "no-template": "không có trong bộ mẫu (tự viết)",
  ambiguous: "bộ mẫu có nhiều file cùng tên — bỏ qua",
};

console.log("[ui:drift] So sánh `<module>/ui/**` với `features/_template/ui/**`\n");
let lastComponent = "";
for (const r of rows) {
  if (r.component !== lastComponent) {
    console.log(`  ${r.component}`);
    lastComponent = r.component;
  }
  const delta =
    r.status === "diverged" ? ` (+${r.added} / -${r.removed} dòng)` : "";
  console.log(`  ${ICON[r.status]} ${r.module.padEnd(28)} ${LABEL[r.status]}${delta}`);
}

const diverged = rows.filter((r) => r.status === "diverged");
const identical = rows.filter((r) => r.status === "identical");
console.log(
  `\n[ui:drift] ${identical.length} bản khớp mẫu · ${diverged.length} bản đã sửa riêng · ${rows.length} file\n`,
);

if (diverged.length > 0) {
  const byComponent = new Map();
  for (const r of diverged) byComponent.set(r.component, (byComponent.get(r.component) ?? 0) + 1);
  const hot = [...byComponent].filter(([, n]) => n >= 3);
  if (hot.length > 0) {
    console.log("⚠️  Cùng một component đã lệch ở ≥3 module:");
    for (const [name, n] of hot) {
      console.log(
        `    ${name} (${n} module) → cân nhắc đưa khác biệt lên token trong app/globals.css,\n` +
          `      rồi cập nhật _template/ui để mọi module dùng lại.`,
      );
    }
    console.log("");
  }
}

if (STRICT && diverged.length > 0) {
  console.error("[ui:drift] --strict: có bản copy lệch bộ mẫu.");
  process.exit(1);
}
console.log("[ui:drift] Chỉ báo cáo, không chặn merge.");
