import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Login() {
  const { user, login, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!nim.trim()) return setError("NIM wajib diisi.");
    setBusy(true);
    try {
      const u = await login(nim);
      notify(`Halo, ${u.name.split(" ")[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page">
      <img src="/logo.svg" alt="" width="72" height="72" className="auth-logo" />
      <h1>Masuk ke KAMU</h1>
      <p className="muted center">Gunakan NIM yang sudah terdaftar.</p>

      <form className="form-card" onSubmit={submit} noValidate>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="nim">NIM</label>
          <input id="nim" inputMode="numeric" autoComplete="username" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Contoh: 21120123140001" />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
      </form>

      <p className="auth-switch">
        Belum punya akun? <Link to="/daftar" state={{ from }}>Daftar</Link>
      </p>
      <p className="auth-switch">
        <Link to="/">Lanjut sebagai tamu</Link>
      </p>
    </div>
  );
}
