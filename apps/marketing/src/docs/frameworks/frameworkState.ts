/**
 * Where the active framework comes from, as pure functions.
 *
 * Split out from the React context so it can be tested without a DOM: the docs
 * app's vitest run is `environment: "node"`, and precedence and persistence are
 * exactly the parts that break quietly. Everything here is total — a browser
 * that refuses storage (Safari's private mode throws on the *property access*,
 * not on the call) must degrade to the default, not blank the page.
 */

import { isDocFramework, type DocFramework } from "@ui-organized/code-connect/browser";

export const DEFAULT_FRAMEWORK: DocFramework = "react";

/** `?framework=svelte` — what makes a docs link carry the framework with it. */
export const FRAMEWORK_PARAM = "framework";

export const FRAMEWORK_STORAGE_KEY = "ui-organized:docs-framework";

/** The slice of `Storage` this needs, so a test can pass a plain object. */
export interface FrameworkStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * The URL wins over the stored preference: a link that says `?framework=vue` was
 * sent by someone showing you Vue, and silently overriding it with whatever this
 * browser last looked at would make such links pointless.
 */
export function resolveFramework(
  param: string | null | undefined,
  stored: string | null | undefined,
): DocFramework {
  if (isDocFramework(param)) return param;
  if (isDocFramework(stored)) return stored;
  return DEFAULT_FRAMEWORK;
}

function defaultStore(): FrameworkStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredFramework(store = defaultStore()): DocFramework | null {
  try {
    const value = store?.getItem(FRAMEWORK_STORAGE_KEY);
    return isDocFramework(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredFramework(framework: DocFramework, store = defaultStore()): void {
  try {
    store?.setItem(FRAMEWORK_STORAGE_KEY, framework);
  } catch {
    // A full or disabled store costs the preference, not the page.
  }
}

/** The current query with the framework set, leaving every other param alone. */
export function withFramework(
  params: URLSearchParams,
  framework: DocFramework,
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set(FRAMEWORK_PARAM, framework);
  return next;
}
