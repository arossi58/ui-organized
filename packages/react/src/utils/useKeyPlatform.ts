import { useEffect, useState } from "react";
import { detectPlatform, type KbdPlatform, type KeyPlatform } from "@ui-organized/core";

/**
 * The platform whose keys to draw. `auto` is `other` on the server and on the
 * first client render, so hydration matches whatever the server drew, and
 * becomes the reader's own platform once mounted.
 */
export function useKeyPlatform(platform: KbdPlatform = "auto"): KeyPlatform {
  const [detected, setDetected] = useState<KeyPlatform>("other");
  useEffect(() => {
    if (platform === "auto") setDetected(detectPlatform());
  }, [platform]);
  return platform === "auto" ? detected : platform;
}
