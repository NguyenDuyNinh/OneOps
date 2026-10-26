#!/usr/bin/env node
/**
 * Sinh file navigation cho từng bề mặt FE.
 *
 * Vì sao phải sinh: nếu mọi người cùng thêm màn hình vào một `nav-items.tsx` thì file đó
 * là điểm conflict số 1 của repo (17 người, mỗi màn hình mới sửa 1–2 dòng). Thay vào đó:
 * - mỗi module tự khai báo `features/<surface>/<module>/nav.tsx` (file riêng, không ai chạm);
 * - script này quét và ráp thành `features/<surface>/navigation/generated.ts` (đã gitignore).
 *
 * Chạy tự động trong `dev`, `build`, `typecheck` của apps/web. KHÔNG sửa tay file generated.
 *
 * Quy ước module:
 *   features/<surface>/<module>/nav.tsx  →  export const <module>Nav: NavSection
 *   (vd. features/admin/users/nav.tsx → export const usersNav)
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FEATURES = join(ROOT, "apps", "web", "src", "features");

/**
 * Thư mục hạ tầng của một bề mặt — không phải module nghiệp vụ nên không có nav.
 * (UI kit dùng chung đã bị bỏ: mỗi module có `ui/` riêng, nằm BÊN TRONG module.)
 */
const SKIP_DIRS = new Set(["app-shell", "components", "hooks", "api", "lib", "ui"]);

/** `attendance-report` → `attendanceReport` */
function toCamel(dirName) {
  return dirName.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function generateFor(surface) {
  const surfaceDir = join(FEATURES, surface);
  if (!existsSync(surfaceDir)) return null;

  const modules = readdirSync(surfaceDir)
    .filter((name) => {
      if (name.startsWith("_") || SKIP_DIRS.has(name)) return false;
      const dir = join(surfaceDir, name);
      if (!statSync(dir).isDirectory()) return false;
      return existsSync(join(dir, "nav.tsx"));
    })
    .sort();

  const entries = modules.map((name) => {
    const exportName = `${toCamel(name)}Nav`;
    const source = readFileSync(join(surfaceDir, name, "nav.tsx"), "utf8");
    if (!new RegExp(`export\\s+const\\s+${exportName}\\b`).test(source)) {
      throw new Error(
        `[gen-nav] ${surface}/${name}/nav.tsx phải export \`const ${exportName}\` (đặt tên theo thư mục module).`,
      );
    }
    return { dir: name, exportName };
  });

  // Registry + kiểu + nhóm cố định nằm trong module `navigation` của bề mặt.
  const navDir = join(surfaceDir, "navigation");
  const hasBase = existsSync(join(navDir, "base.tsx"));
  const lines = [
    "/* eslint-disable */",
    "// ⚠️ FILE ĐƯỢC SINH TỰ ĐỘNG bởi scripts/gen-nav.mjs — KHÔNG SỬA TAY, ĐÃ GITIGNORE.",
    "// Thêm màn hình: tạo `features/" + surface + "/<module>/nav.tsx` rồi chạy `pnpm nav:gen`",
    "// (hoặc chỉ cần khởi động lại `pnpm dev` / chạy `pnpm typecheck`).",
    "",
    'import type { NavSection } from "./types";',
  ];
  if (hasBase) {
    lines.push('import { navFirst, navLast } from "./base";');
  }
  for (const { dir, exportName } of entries) {
    lines.push(`import { ${exportName} } from "../${dir}/nav";`);
  }
  lines.push(
    "",
    `export const navSections: NavSection[] = [`,
    ...(hasBase ? ["  ...navFirst,"] : []),
    ...entries.map(({ exportName }) => `  ${exportName},`),
    ...(hasBase ? ["  ...navLast,"] : []),
    "];",
    "",
  );

  const target = join(navDir, "generated.ts");
  const next = lines.join("\n");
  const prev = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (prev !== next) writeFileSync(target, next, "utf8");

  return { surface, count: entries.length, modules: entries.map((e) => e.dir) };
}

const results = ["admin", "employee"].map(generateFor).filter(Boolean);
if (results.length === 0) {
  console.log("[gen-nav] không tìm thấy bề mặt nào — bỏ qua.");
} else {
  for (const r of results) {
    console.log(
      `[gen-nav] ${r.surface}: ${r.count} module${r.count === 1 ? "" : "s"}` +
        (r.count ? ` (${r.modules.join(", ")})` : ""),
    );
  }
}
