import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { initials } from "../utils/format.js";
import { IconArrowLeft } from "./Icons.jsx";

export default function Header({ variant = "page", title, subtitle, back = false, right = null }) {
  const navigate = useNavigate();
  const { user } = useApp();

  const goBack = () => {
    // idx > 0 berarti ada halaman sebelumnya di dalam aplikasi
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  if (variant === "brand") {
    return (
      <header className="header header-brand">
        <Link to="/" className="brand" aria-label="KAMU, ke beranda">
          <img src="/logo.svg" alt="" width="42" height="42" className="brand-logo" />
          <span className="brand-text">
            <strong>KAMU</strong>
            <small>Marketplace Mahasiswa</small>
          </span>
        </Link>
        <Link
          to={user ? "/profil" : "/login"}
          className="header-user"
          aria-label={user ? "Buka profil" : "Masuk"}
        >
          {user ? (
            <span className="avatar avatar-sm">{initials(user.name)}</span>
          ) : (
            <span className="btn btn-primary btn-sm">Masuk</span>
          )}
        </Link>
      </header>
    );
  }

  return (
    <header className="header header-page">
      {back && (
        <button className="icon-btn" onClick={goBack} aria-label="Kembali">
          <IconArrowLeft size={22} />
        </button>
      )}
      <div className="header-titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
