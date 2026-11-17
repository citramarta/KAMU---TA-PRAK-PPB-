import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { initials } from "../utils/format.js";
import { IconPlus } from "./Icons.jsx";

const LINKS = [
  { to: "/", label: "Beranda", end: true },
  { to: "/jelajah", label: "Jelajahi" },
  { to: "/favorit", label: "Favorit", badge: true },
  { to: "/profil", label: "Profil" },
];

// Navigasi atas untuk layar lebar (laptop/desktop). Di HP dan tablet yang tampil adalah BottomNav.
export default function TopNav() {
  const { user, wishlist } = useApp();

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="brand" aria-label="KAMU, ke beranda">
          <img src="/logo.svg" alt="" width="40" height="40" className="brand-logo" />
          <span className="brand-text">
            <strong>KAMU</strong>
            <small>Marketplace Mahasiswa</small>
          </span>
        </Link>

        <nav className="topnav-links" aria-label="Navigasi utama">
          {LINKS.map(({ to, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `topnav-link${isActive ? " active" : ""}`}>
              {label}
              {badge && user && wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-actions">
          <Link to="/jual" className="btn btn-pink btn-sm">
            <IconPlus size={18} /> Jual Barang
          </Link>
          {user ? (
            <Link to="/profil" className="avatar avatar-sm" aria-label="Buka profil">
              {initials(user.name)}
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
