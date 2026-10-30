import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  dependencySpecifier,
  literalSpecifier,
} from "./source-dependencies.mjs";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bases = ["apps/web/src", "apps/api/src"];
function walk(p) {
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter(
      (e) => !["generated", "node_modules", "dist", ".next"].includes(e.name),
    )
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)],
    );
}
const files = bases
  .flatMap((b) => walk(path.join(root, b)))
  .filter((f) => /\.(ts|tsx|json|css)$/.test(f));
files.push(
  path.join(root, "packages/database/index.ts"),
  path.join(root, "packages/database/prisma.config.ts"),
);
const edges = new Map();
function resolve(p) {
  for (const file of [
    p,
    p + ".ts",
    p + ".tsx",
    p + ".json",
    p + ".css",
    path.join(p, "index.ts"),
    path.join(p, "index.tsx"),
    p.replace(/\.js$/, ".ts"),
  ])
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
}
for (const file of files) {
  const deps = [];
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(n) {
    const s = literalSpecifier(dependencySpecifier(n));
    if (s !== undefined) {
      const target = s.startsWith(".")
        ? resolve(path.resolve(path.dirname(file), s))
        : s.startsWith("@/")
          ? resolve(path.join(root, "apps/web/src", s.slice(2)))
          : s === "@oneops/database"
            ? resolve(path.join(root, "packages/database/index.ts"))
            : null;
      if (target) deps.push(target);
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
  if (file.endsWith(".css"))
    for (const [, s] of fs
      .readFileSync(file, "utf8")
      .matchAll(/@import\s+"(\.[^"]+)"/g)) {
      const t = resolve(path.resolve(path.dirname(file), s));
      if (t) deps.push(t);
    }
  edges.set(file, deps);
}
const roots = files.filter(
  (f) =>
    f.includes("/apps/web/src/app/") &&
    /(?:page|route|layout|not-found)\.tsx?$/.test(f),
);
roots.push(
  path.join(root, "apps/api/src/main.ts"),
  path.join(root, "packages/database/prisma.config.ts"),
);
const used = new Set();
function reach(f) {
  if (used.has(f)) return;
  used.add(f);
  for (const d of edges.get(f) || []) reach(d);
}
roots.forEach(reach);
const unreachable = files
  .filter((file) => !used.has(file))
  .map((file) => path.relative(root, file));
if (unreachable.length) {
  console.error("Unreachable source files:\n" + unreachable.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `All ${files.length} source files are reachable from application entrypoints.`,
  );
