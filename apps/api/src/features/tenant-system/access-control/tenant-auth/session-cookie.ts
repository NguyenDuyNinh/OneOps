export const SESSION_COOKIE = "oneops_session";

export function sessionToken(cookieHeader?: string) {
  if (!cookieHeader) return "";
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() !== SESSION_COOKIE) continue;
    return decodeURIComponent(part.slice(index + 1).trim());
  }
  return "";
}

/** Session cookies live for the browser session; the API enforces the idle timeout. */
export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.COOKIE_SECURE === "1",
});
