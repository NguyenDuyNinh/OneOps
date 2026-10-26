#!/usr/bin/env node
/**
 * Chặn "trôi kiến trúc" trước khi merge (dùng cho 17 người).
 *
 * Mô hình: `features/auth` (dùng chung) + `features/<surface>/<module>` (bề mặt),
 * và **mỗi module tự sở hữu UI riêng** trong `<module>/ui/`. Không có UI kit dùng chung.
 *
 * Các luật được kiểm tra:
 *  0. `features/auth` (dùng chung) không được import module nghiệp vụ của bề mặt nào.
 *  0b. Trang auth (`app/(auth)/**`) chỉ được dùng `features/auth` — không dùng UI/component
 *      của `features/admin/**` hay `features/employee/**`.
 *  1. `features/admin/**` không import `features/employee/**`.
 *  2. `features/employee/**` không import module nghiệp vụ của `admin` (chỉ `app-shell`).
 *  3. Module nghiệp vụ không import module nghiệp vụ khác cùng bề mặt.
 *  4. Không module nào được import `ui/` của module khác — UI là bản riêng của từng module.
 *  5. Import xuyên module phải qua barrel `@/features/<surface>/<module>`.
 *  6. Không import `features/_template/**` (chỉ để copy, không phải dependency).
 *  7. Web không import code backend; không `console.log`.
 *
 * Chạy: `pnpm lint:structure` (có trong CI). Sai luật → exit 1.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_SRC = join(ROOT, "apps", "web", "src");

/** Hạ tầng trong một bề mặt: được mọi module của bề mặt đó dùng.
 *  - `app-shell`: header/sidebar/context.
 *  - `navigation`: kiểu NavSection + registry menu (sinh tự động).
 */
const INFRA_MODULES = new Set(["app-shell", "navigation"]);
/** Module dùng chung cho mọi bề mặt (đăng nhập, phiên, HTTP client). */
const SHARED_MODULES = new Set(["auth"]);
const SURFACES = new Set(["admin", "employee"]);
const SKIP_FILE = /\/navigation\/generated\.ts$/;

/** @type {{file: string, line: number, message: string}[]} */
const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(name)) {
      checkFile(full);
    }
  }
}

/** @param {string} spec */
function parseFeatureSpec(spec) {
  if (!spec.startsWith("@/features/")) return null;
  const parts = spec.slice("@/features/".length).split("/");
  const surface = SURFACES.has(parts[0]) ? parts[0] : null;
  const module = surface ? parts[1] : parts[0];
  const rest = surface ? parts.slice(2) : parts.slice(1);
  return { surface, module, rest };
}

function report(file, index, text, message) {
  const line = text.slice(0, index).split("\n").length;
  violations.push({ file: relative(ROOT, file), line, message });
}

function checkFile(file) {
  if (SKIP_FILE.test(file)) return;

  const rel = relative(WEB_SRC, file);
  // Bỏ tiền tố `features/` để `srcParts[0]` là bề mặt hoặc module dùng chung.
  const relToFeatures = rel.startsWith(`features${sep}`)
    ? rel.slice(`features${sep}`.length)
    : rel;
  const srcParts = relToFeatures.split(sep);
  const srcSurface = SURFACES.has(srcParts[0]) ? srcParts[0] : null;
  const srcModule = srcSurface ? (srcParts[1] ?? srcParts[0]) : srcParts[0];

  /** Trang đăng nhập/đăng ký: chỉ được dùng UI của `features/auth`. */
  const isAuthRoute = rel.startsWith(`app${sep}(auth)${sep}`);

  const text = readFileSync(file, "utf8");

  // Luật 7a: web không kéo code backend
  for (const m of text.matchAll(/from\s+"(@oneops\/[^"]+|\.\.\/\.\.\/\.\.\/\.\.\/apps\/api[^"]*)"/g)) {
    report(file, m.index, text, `web không được import code backend: ${m[1]}`);
  }

  // Luật 7b: không console.log
  for (const m of text.matchAll(/console\.log\(/g)) {
    report(file, m.index, text, "không dùng console.log (AGENTS điều 3) — dùng UI/log có kiểm soát");
  }

  for (const m of text.matchAll(/from\s+"([^"]+)"/g)) {
    const spec = m[1];
    const target = parseFeatureSpec(spec);
    if (!target) continue;
    const { surface: tSurface, module: tModule, rest } = target;
    const tIsInfra = INFRA_MODULES.has(tModule);
    const tIsShared = SHARED_MODULES.has(tModule) && tSurface === null;
    const isSelf = srcSurface === tSurface && srcModule === tModule;

    // Luật 6: _template chỉ để copy
    if (tModule === "_template") {
      report(file, m.index, text, `không import từ _template (chỉ để copy thủ công): ${spec}`);
      continue;
    }

    // Luật 0b: trang auth chỉ dùng UI của features/auth
    if (isAuthRoute && !(tSurface === null && tModule === "auth")) {
      report(
        file,
        m.index,
        text,
        `trang auth chỉ được dùng "features/auth" — không dùng ${spec} (auth là bề mặt độc lập)`,
      );
      continue;
    }

    // Luật 0: module dùng chung không phụ thuộc bề mặt
    if (srcSurface === null && SHARED_MODULES.has(srcModule) && tSurface !== null && !tIsInfra) {
      report(file, m.index, text, `module dùng chung "${srcModule}" không được import "${spec}" — thêm cái cần dùng vào chính nó`);
      continue;
    }

    // Luật 1
    if (srcSurface === "admin" && tSurface === "employee") {
      report(file, m.index, text, `bề mặt admin không được import bề mặt employee: ${spec}`);
      continue;
    }

    // Luật 2
    if (srcSurface === "employee" && tSurface === "admin" && !tIsInfra) {
      report(file, m.index, text, `bề mặt employee chỉ được dùng admin/app-shell — không dùng ${spec}`);
      continue;
    }

    // Luật 3: module nghiệp vụ không import module nghiệp vụ khác cùng bề mặt
    if (
      srcSurface &&
      srcSurface === tSurface &&
      !INFRA_MODULES.has(srcModule) &&
      tModule !== srcModule &&
      !tIsInfra
    ) {
      report(file, m.index, text, `module "${srcModule}" không được import module "${tModule}" (${spec})`);
      continue;
    }

    // Luật 4: UI là bản riêng của từng module
    if (!isSelf && rest[0] === "ui") {
      report(
        file,
        m.index,
        text,
        `UI là riêng của từng module — copy file bạn cần vào \`${srcSurface ? `${srcSurface}/` : ""}${srcModule}/ui/\` thay vì import ${spec}`,
      );
      continue;
    }

    // Luật 5: import xuyên module phải qua barrel
    const moduleDir = tSurface
      ? join(WEB_SRC, "features", tSurface, tModule)
      : join(WEB_SRC, "features", tModule);
    const hasBarrel = existsSync(join(moduleDir, "index.ts"));
    const importedDeep = rest.length > 0;

    if (hasBarrel && importedDeep && !isSelf && !tIsShared) {
      report(
        file,
        m.index,
        text,
        `import xuyên module phải qua barrel: "@/features/${tSurface ? `${tSurface}/` : ""}${tModule}" (đang là ${spec})`,
      );
    }
  }
}

walk(WEB_SRC);

if (violations.length === 0) {
  console.log("[structure] OK — không có vi phạm ranh giới.");
  process.exit(0);
}

console.error(`[structure] ${violations.length} vi phạm:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.message}`);
}
console.error("\nXem AGENTS.md §3 (Frontend) để biết luật tương ứng.");
process.exit(1);
