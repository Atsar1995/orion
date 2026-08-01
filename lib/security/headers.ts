/** Production security response headers (Mission S1D). */
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
};

/** Content Security Policy for ORION executive surfaces. */
export function buildContentSecurityPolicy(isProduction: boolean): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (!isProduction) {
    directives.push("connect-src 'self' ws: wss:");
  }

  return directives.join("; ");
}

export function applySecurityHeaders(
  response: Headers,
  options: { isProduction?: boolean } = {},
): void {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.set(key, value);
  }

  response.set("Content-Security-Policy", buildContentSecurityPolicy(isProduction));
}
