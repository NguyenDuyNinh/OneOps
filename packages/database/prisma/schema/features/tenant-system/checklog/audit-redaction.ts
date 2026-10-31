const SENSITIVE_KEY =
  /pass(word|code)?|secret|token|hash|credential|authorization|cookie|salt|private_?key/i;
const MAX_DEPTH = 6;

/** Marker written in place of a secret; the value itself never reaches storage. */
export const REDACTED = "[đã ẩn]";

/**
 * Strips secret material from an audit value before it is persisted. Producers
 * may pass whole form payloads, so redaction happens by construction here
 * instead of relying on every caller to remember it.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[…]";
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>))
      output[key] = SENSITIVE_KEY.test(key)
        ? REDACTED
        : redact(item, depth + 1);
    return output;
  }
  return value;
}
