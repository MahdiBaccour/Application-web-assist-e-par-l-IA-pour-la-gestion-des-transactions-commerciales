"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function TokenRefresher() {
  const { data: session, update, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.refreshToken) return;

    console.log("🔁 TokenRefresher started");

    const refreshInterval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: session.user.refreshToken }),
        });

        const data = await res.json();

        if (data.success) {
          console.log("✅ New tokens received:", data.accessToken);
          await update({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });

          // Optional debug step
          const freshSession = await fetch("/api/auth/session");
          const json = await freshSession.json();
          console.log("🆕 Session from server:", json.user.accessToken);
        } else {
          console.warn("⛔ Refresh failed. Signing out...");
          signOut();
        }
      } catch (error) {
        console.error("🔥 Error refreshing token:", error);
        signOut();
      }
    },60 * 60 * 2 * 1000); // every  for testing

    return () => clearInterval(refreshInterval);
  }, [status, session, update]);

  return null;
}