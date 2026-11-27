import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api.js";

const KEY = "kamu_user";
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

const writeUser = (user) => {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* localStorage tidak tersedia */
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [wishlist, setWishlist] = useState([]);
  const [wishLoading, setWishLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.("(display-mode: standalone)").matches || false
  );
  const toastTimer = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  // ---------- Wishlist ----------
  const loadWishlist = useCallback(async (userId) => {
    if (!userId) {
      setWishlist([]);
      return;
    }

    setWishLoading(true);
    try {
      setWishlist(await api.wishlist(userId));
    } catch {
      /* offline: pertahankan data terakhir */
    } finally {
      setWishLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist(user?.id);
  }, [user?.id, loadWishlist]);

  const wishIds = useMemo(() => new Set(wishlist.map((w) => w.id)), [wishlist]);

  const toggleWish = useCallback(
    async (item) => {
      if (!user) return "login";

      const had = wishIds.has(item.id);
      setWishlist((prev) =>
        had ? prev.filter((w) => w.id !== item.id) : [{ ...item }, ...prev]
      );

      try {
        if (had) await api.removeWishlist(user.id, item.id);
        else await api.addWishlist(user.id, item.id);
      } catch (err) {
        await loadWishlist(user.id);
        throw err;
      }

      return had ? "removed" : "added";
    },
    [user, wishIds, loadWishlist]
  );

  // ---------- Auth ----------
  const login = useCallback(async (nim) => {
    const u = await api.login(nim.trim());
    writeUser(u);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await api.register(data);
    writeUser(u);
    setUser(u);
    return u;
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!user?.id) throw new Error("Kamu belum login.");

    const updatedUser = await api.updateUser(user.id, data);
    writeUser(updatedUser);
    setUser(updatedUser);

    return updatedUser;
  }, [user]);

  const logout = useCallback(() => {
    writeUser(null);
    setUser(null);
    setWishlist([]);
  }, []);

  // ---------- Install PWA ----------
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }, [installEvent]);

  const value = {
    user,
    login,
    register,
    updateProfile,
    logout,
    wishlist,
    wishIds,
    wishLoading,
    toggleWish,
    toast,
    notify,
    canInstall: Boolean(installEvent),
    installed,
    install,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}