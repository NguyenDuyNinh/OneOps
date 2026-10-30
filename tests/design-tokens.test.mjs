import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  compileTokens,
  resolveToken,
  contrastRatio,
  buildTokens,
} from "../scripts/build-tokens.mjs";
const source = JSON.parse(
  await readFile(new URL("../tokens/source.json", import.meta.url), "utf8"),
);
test("all four profiles resolve every alias and keep matching token names", () => {
  const { profiles } = compileTokens(source);
  const keys = Object.keys(profiles["light-comfortable"].tokens).sort();
  for (const profile of Object.values(profiles)) {
    assert.deepEqual(Object.keys(profile.tokens).sort(), keys);
    for (const value of Object.values(profile.tokens))
      assert.doesNotMatch(String(value), /\{[\w-]+\}/);
  }
});
test("aliases reject missing references and cycles", () => {
  assert.throws(
    () => resolveToken("a", { a: { value: "{missing}" } }),
    /Unknown token/,
  );
  assert.throws(
    () => resolveToken("a", { a: { value: "{b}" }, b: { value: "{a}" } }),
    /cycle/,
  );
});
test("component aliases follow theme and density", () => {
  const { profiles } = compileTokens(source);
  assert.equal(profiles["light-comfortable"].tokens["button-height"], "40px");
  assert.equal(profiles["dark-compact"].tokens["button-height"], "34px");
  assert.equal(
    profiles["dark-compact"].tokens["button-bg"],
    profiles["dark-compact"].tokens.action,
  );
  assert.equal(
    profiles["light-comfortable"].tokens["table-row-height"],
    "56px",
  );
});
test("declared foreground/background pairs reach the 4.5 contrast target", () => {
  const result = compileTokens(source);
  for (const pair of result.contrast)
    assert.ok(pair.ratio >= 4.5, `${pair.theme}: ${pair.label} ${pair.ratio}`);
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
});
test("generated CSS, catalog and downloads match source", async () => {
  await buildTokens(true);
});
