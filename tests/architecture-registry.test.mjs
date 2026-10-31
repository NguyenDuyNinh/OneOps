import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  collectRegistryKeys,
  delegateName,
  moduleKind,
  moduleKinds,
  ownedDelegates,
  ownedModels,
  ownedSchemas,
  validateRegistry,
} from "../scripts/module-registry.mjs";

const base = {
  name: "sample",
  feature: "work-management/work/sample",
  route: "sample",
  webRoute: "/work-management/sample",
  databaseSchema: "work_sample",
  model: "WorkSample",
  schema:
    "apps/api/src/features/work-management/work/sample/prisma/sample.prisma",
};
const entry = (overrides = {}) => ({ ...base, ...overrides });
const modules = JSON.parse(
  await readFile(new URL("../modules.json", import.meta.url), "utf8"),
);

test("legacy single model and schema normalize to owned lists", () => {
  assert.deepEqual(ownedModels(entry()), ["WorkSample"]);
  assert.deepEqual(ownedSchemas(entry()), [base.schema]);
});

test("multiple models and schemas are additive", () => {
  const multi = entry({
    model: undefined,
    schema: undefined,
    models: ["WorkSample", "WorkSampleVersion"],
    schemas: ["prisma/sample.prisma", "prisma/sample-version.prisma"],
  });
  assert.deepEqual(ownedModels(multi), ["WorkSample", "WorkSampleVersion"]);
  assert.equal(ownedSchemas(multi).length, 2);
  assert.deepEqual(ownedDelegates(multi), ["workSample", "workSampleVersion"]);
  assert.deepEqual(validateRegistry([multi]), []);
});

test("delegate names are camelCase of the model name", () => {
  assert.equal(delegateName("WorkNotification"), "workNotification");
  assert.equal(delegateName("A"), "a");
});

test("declaring both model and models is rejected", () => {
  const failures = validateRegistry([entry({ models: ["Other"] })]);
  assert.ok(
    failures.some((item) => item.includes("either model or models")),
    failures.join("\n"),
  );
});

test("declaring both schema and schemas is rejected", () => {
  const failures = validateRegistry([entry({ schemas: ["other.prisma"] })]);
  assert.ok(
    failures.some((item) => item.includes("either schema or schemas")),
    failures.join("\n"),
  );
});

test("missing ownership declarations are rejected", () => {
  const failures = validateRegistry([
    entry({ model: undefined, schema: undefined }),
  ]);
  assert.ok(
    failures.some((item) => item.includes("at least one model")),
    failures.join("\n"),
  );
  assert.ok(
    failures.some((item) => item.includes("at least one schema file")),
    failures.join("\n"),
  );
});

test("duplicate namespace, route, model and schema are rejected", () => {
  const failures = validateRegistry([
    entry(),
    entry({
      name: "sample-two",
      feature: "work-management/work/sample-two",
      models: ["WorkSample"],
      schemas: [base.schema],
    }),
  ]);
  assert.ok(
    failures.some((item) => item.includes("duplicate namespace")),
    failures.join("\n"),
  );
  assert.ok(
    failures.some((item) => item.includes("duplicate API route")),
    failures.join("\n"),
  );
  assert.ok(
    failures.some((item) => item.includes("duplicate model")),
    failures.join("\n"),
  );
  assert.ok(
    failures.some((item) => item.includes("duplicate schema")),
    failures.join("\n"),
  );
});

test("missing required registry fields are rejected", () => {
  const failures = validateRegistry([{ name: "incomplete" }]);
  for (const key of ["feature", "route", "webRoute", "databaseSchema"])
    assert.ok(
      failures.some((item) => item.includes(`missing ${key}`)),
      `${key}: ${failures.join("\n")}`,
    );
});

test("non-array registry input is rejected", () => {
  assert.deepEqual(validateRegistry({}), [
    "modules.json must contain an array",
  ]);
});

test("modules default to the records kind and accept resource kind", () => {
  assert.equal(moduleKind(entry()), "records");
  assert.equal(moduleKind(entry({ kind: "resource" })), "resource");
  assert.deepEqual(validateRegistry([entry({ kind: "resource" })]), []);
});

test("unknown module kinds are rejected", () => {
  const failures = validateRegistry([entry({ kind: "records-plus" })]);
  assert.ok(
    failures.some((item) => item.includes("kind must be one of")),
    failures.join("\n"),
  );
  assert.deepEqual(moduleKinds, ["records", "resource"]);
});

test("the repository registry is valid and has no duplicates", () => {
  assert.deepEqual(validateRegistry(modules), []);
  const { namespaces, models, routes } = collectRegistryKeys(modules);
  assert.equal(namespaces.size, modules.length);
  assert.equal(routes.size, modules.length);
  assert.ok(models.size >= modules.length);
});

test("registry namespaces match the Prisma base schema", async () => {
  const basePrisma = await readFile(
    new URL("../packages/database/prisma/schema/base.prisma", import.meta.url),
    "utf8",
  );
  const declared = basePrisma.match(/schemas\s*=\s*(\[[\s\S]*?\])/);
  assert.ok(declared, "base.prisma must declare schemas");
  assert.deepEqual(
    JSON.parse(declared[1]).sort(),
    [...collectRegistryKeys(modules).namespaces].sort(),
  );
});
