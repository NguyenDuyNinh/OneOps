import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const structure = JSON.parse(
  await fs.readFile(path.join(root, "feature-structure.json"), "utf8"),
);
const directories = [];
for (const [main, groups] of Object.entries(structure))
  for (const [group, features] of Object.entries(groups))
    // An empty list denotes a feature directly under the main group (checklog).
    for (const featurePath of features.length
      ? features.map((feature) => `${main}/${group}/${feature}`)
      : [`${main}/${group}`]) {
      for (const folder of [
        "prisma",
        "dto",
        "entities",
        "guards",
        "middlewares",
        "listeners",
      ])
        directories.push(`apps/api/src/features/${featurePath}/${folder}`);
      for (const folder of ["components", "hooks", "api", "actions"])
        directories.push(`apps/web/src/features/${featurePath}/${folder}`);
    }
for (const folder of [
  "auth",
  "config",
  "database",
  "decorators",
  "events",
  "filters",
  "interceptors",
  "pipes",
  "realtime",
  "types",
])
  directories.push(`apps/api/src/core/${folder}`);
for (const folder of ["constants", "helpers"])
  directories.push(`apps/api/src/shared/${folder}`);
for (const folder of [
  "ui",
  "layout",
  "shared",
  "hooks",
  "context",
  "lib",
  "types",
  "constants",
  "config",
])
  directories.push(`apps/web/src/core/${folder}`);
for (const folder of [
  "(auth)",
  "(error-pages)",
  "tenant-system",
  "work-management",
  "hr-management",
  "crm",
  "work-management/notifications",
  "hr-management/attendance",
  "hr-management/leaves",
])
  directories.push(`apps/web/src/app/${folder}`);
directories.push(
  "packages/database/prisma/seed",
  "packages/database/generated",
  "apps/web/src/icons",
);
await Promise.all(
  directories.map((folder) =>
    fs.mkdir(path.join(root, folder), { recursive: true }),
  ),
);
console.log(
  "Reference feature folders prepared; no placeholder source or fake endpoints created.",
);
