import { test as base, expect } from "@playwright/test";
import { cleanDatabase } from "../apps/api/test/database.mjs";
export const test = base.extend<{ databaseClean: void }>({
  databaseClean: [
    async ({}, use) => {
      await cleanDatabase();
      await use();
    },
    { auto: true },
  ],
});
export { expect };
