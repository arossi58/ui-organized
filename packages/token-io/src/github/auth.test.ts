import { describe, it, expect } from "vitest";
import {
  requestDeviceCode,
  pollDeviceTokenOnce,
  pollForDeviceToken,
  looksLikeToken,
} from "./auth.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** A fetch mock that returns queued responses in order. */
function queuedFetch(responses: Response[]) {
  let i = 0;
  return async () => responses[Math.min(i++, responses.length - 1)]!;
}

describe("requestDeviceCode", () => {
  it("parses the device code response", async () => {
    const fetchFn = queuedFetch([
      jsonResponse({
        device_code: "dc",
        user_code: "WXYZ-1234",
        verification_uri: "https://github.com/login/device",
        expires_in: 900,
        interval: 5,
      }),
    ]);
    const code = await requestDeviceCode({ clientId: "cid", fetchFn });
    expect(code.user_code).toBe("WXYZ-1234");
    expect(code.interval).toBe(5);
  });
});

describe("pollDeviceTokenOnce", () => {
  it("maps the pending / token / slow_down / error responses", async () => {
    const pending = await pollDeviceTokenOnce({
      clientId: "c",
      deviceCode: "d",
      fetchFn: queuedFetch([jsonResponse({ error: "authorization_pending" })]),
    });
    expect(pending).toEqual({ status: "pending" });

    const token = await pollDeviceTokenOnce({
      clientId: "c",
      deviceCode: "d",
      fetchFn: queuedFetch([jsonResponse({ access_token: "ghp_abc" })]),
    });
    expect(token).toEqual({ status: "token", accessToken: "ghp_abc" });

    const slow = await pollDeviceTokenOnce({
      clientId: "c",
      deviceCode: "d",
      fetchFn: queuedFetch([jsonResponse({ error: "slow_down", interval: 10 })]),
    });
    expect(slow).toEqual({ status: "slow_down", interval: 10 });

    const err = await pollDeviceTokenOnce({
      clientId: "c",
      deviceCode: "d",
      fetchFn: queuedFetch([jsonResponse({ error: "expired_token" })]),
    });
    expect(err).toEqual({ status: "error", error: "expired_token" });
  });
});

describe("pollForDeviceToken", () => {
  it("polls until the token is returned (pending → token)", async () => {
    const fetchFn = queuedFetch([
      jsonResponse({ error: "authorization_pending" }),
      jsonResponse({ access_token: "ghp_final" }),
    ]);
    const token = await pollForDeviceToken({
      clientId: "c",
      deviceCode: "d",
      intervalSeconds: 1,
      expiresInSeconds: 60,
      fetchFn,
      sleep: async () => {},
    });
    expect(token).toBe("ghp_final");
  });

  it("throws on a fatal error", async () => {
    const fetchFn = queuedFetch([jsonResponse({ error: "access_denied" })]);
    await expect(
      pollForDeviceToken({
        clientId: "c",
        deviceCode: "d",
        intervalSeconds: 1,
        expiresInSeconds: 60,
        fetchFn,
        sleep: async () => {},
      }),
    ).rejects.toThrow(/access_denied/);
  });
});

describe("looksLikeToken", () => {
  it("recognizes GitHub token shapes", () => {
    expect(looksLikeToken("ghp_" + "a".repeat(36))).toBe(true);
    expect(looksLikeToken("github_pat_" + "a".repeat(40))).toBe(true);
    expect(looksLikeToken("nope")).toBe(false);
  });
});
