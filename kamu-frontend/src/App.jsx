import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import BottomNav from "./components/BottomNav.jsx";
import TopNav from "./components/TopNav.jsx";
import Footer from "./components/Footer.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
import { EmptyState } from "./components/States.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Detail from "./pages/Detail.jsx";
import Sell from "./pages/Sell.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Profile from "./pages/Profile.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const NO_NAV = ["/login", "/daftar"];

export default function App() {
  const { toast } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const hideNav = NO_NAV.includes(pathname);

  return (
    <div className="app-shell">
      <OfflineBanner />
      <TopNav />
      <main className={`app-main${hideNav ? " no-nav" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jelajah" element={<Explore />} />
          <Route path="/barang/:id" element={<Detail />} />
          <Route path="/jual" element={<Sell />} />
          <Route path="/favorit" element={<Wishlist />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route
            path="*"
            element={
              <div className="page">
                <EmptyState
                  title="Halaman tidak ditemukan"
                  text="Alamat yang kamu tuju tidak ada."
                  action={
                    <Link to="/" className="btn btn-primary btn-sm">
                      Ke Beranda
                    </Link>
                  }
                />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      {!hideNav && <BottomNav />}
      {toast && (
        <div className={`toast${hideNav ? " no-nav" : ""}`} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
