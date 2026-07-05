"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, type Token, type PermissionStatus } from "@capacitor/push-notifications";

// Requests push permission and registers this device's token with our
// backend. No-ops on web — push tokens only make sense inside the native
// app. Safe to mount once anywhere under the dashboard.
export default function PushInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    (async () => {
      let perm: PermissionStatus = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted" || cancelled) return;

      await PushNotifications.addListener("registration", async (token: Token) => {
        try {
          await fetch("/api/push-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.value, platform: "ios" }),
          });
        } catch {
          // best-effort; retried on next app launch
        }
      });

      await PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration error:", err);
      });

      await PushNotifications.register();
    })();

    return () => {
      cancelled = true;
      PushNotifications.removeAllListeners();
    };
  }, []);

  return null;
}
