import type { FetchFn } from "./client.js";

/**
 * GitHub OAuth **device flow** — zero-infra auth that needs no client secret. The
 * resulting token is repo-scoped and must be held in memory only by the caller
 * (never localStorage / URL).
 *
 * Browser note: `github.com/login/*` does not send CORS headers, so a pure
 * browser SPA must route these two calls through a proxy (the optional
 * oauth-exchange function) or use a pasted fine-grained PAT (see
 * `07-github.md`). `baseUrl` is configurable for exactly that. The logic here is
 * transport-agnostic and unit-tested with an injected `fetch`.
 */

const DEFAULT_BASE = "https://github.com";
const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export type PollResult =
  | { status: "pending" }
  | { status: "slow_down"; interval: number }
  | { status: "token"; accessToken: string }
  | { status: "error"; error: string };

interface BaseOpts {
  fetchFn?: FetchFn;
  baseUrl?: string;
}

function fetchFn(opts: BaseOpts): FetchFn {
  return opts.fetchFn ?? (globalThis.fetch.bind(globalThis) as FetchFn);
}

/** Step 1: request a device + user code. Show the user the code + verification URI. */
export async function requestDeviceCode(
  opts: BaseOpts & { clientId: string; scope?: string },
): Promise<DeviceCode> {
  const res = await fetchFn(opts)(`${opts.baseUrl ?? DEFAULT_BASE}/login/device/code`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: opts.clientId, scope: opts.scope ?? "repo" }),
  });
  if (!res.ok) throw new Error(`Device code request failed: ${res.status}`);
  return (await res.json()) as DeviceCode;
}

/** Step 2 (single attempt): poll for the access token. */
export async function pollDeviceTokenOnce(
  opts: BaseOpts & { clientId: string; deviceCode: string },
): Promise<PollResult> {
  const res = await fetchFn(opts)(`${opts.baseUrl ?? DEFAULT_BASE}/login/oauth/access_token`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: opts.clientId,
      device_code: opts.deviceCode,
      grant_type: GRANT_TYPE,
    }),
  });
  if (!res.ok) return { status: "error", error: `HTTP ${res.status}` };
  const data = (await res.json()) as { access_token?: string; error?: string; interval?: number };
  if (data.access_token) return { status: "token", accessToken: data.access_token };
  if (data.error === "authorization_pending") return { status: "pending" };
  if (data.error === "slow_down") return { status: "slow_down", interval: data.interval ?? 5 };
  return { status: "error", error: data.error ?? "unknown_error" };
}

const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Step 2 (loop): polls until the user authorizes, returning the access token, or
 * throws on error/expiry. `sleep` is injectable for tests.
 */
export async function pollForDeviceToken(
  opts: BaseOpts & {
    clientId: string;
    deviceCode: string;
    intervalSeconds: number;
    expiresInSeconds: number;
    sleep?: (ms: number) => Promise<void>;
  },
): Promise<string> {
  const sleep = opts.sleep ?? defaultSleep;
  let interval = Math.max(1, opts.intervalSeconds);
  const maxAttempts = Math.max(1, Math.floor(opts.expiresInSeconds / interval));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(interval * 1000);
    const result = await pollDeviceTokenOnce(opts);
    if (result.status === "token") return result.accessToken;
    if (result.status === "error") throw new Error(`Device flow failed: ${result.error}`);
    if (result.status === "slow_down") interval = result.interval;
  }
  throw new Error("Device flow timed out before authorization");
}

/** Loose check that a string looks like a GitHub token (PAT escape hatch). */
export function looksLikeToken(token: string): boolean {
  return /^gh[pousr]_[A-Za-z0-9_]{20,}$/.test(token) || /^github_pat_[A-Za-z0-9_]{20,}$/.test(token);
}
