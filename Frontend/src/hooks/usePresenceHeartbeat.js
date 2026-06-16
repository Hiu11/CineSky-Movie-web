import { useEffect } from "react";
import { sendPresenceHeartbeat } from "../services/presenceService";

const HEARTBEAT_INTERVAL_MS = 30 * 1000;

export default function usePresenceHeartbeat(location) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const getCurrentPath = () =>
      [location.pathname, location.search, location.hash].filter(Boolean).join("") || "/";

    const ping = () => {
      sendPresenceHeartbeat({ currentPath: getCurrentPath() }).catch(() => {});
    };

    ping();
    const intervalId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ping();
      }
    };

    window.addEventListener("focus", ping);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", ping);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.hash, location.pathname, location.search]);
}
