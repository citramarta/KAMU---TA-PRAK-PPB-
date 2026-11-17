import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Register() {
  const { user, register, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [form, setForm] = useState({ name: "", nim: "", faculty: "", whatsapp: "", email: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.nim.trim()) return setError("Nama dan NIM wajib diisi.");
    setBusy(true);
    try {
      const u = await register({
        name: form.name.trim(),
        nim: form.nim.trim(),
        faculty: form.faculty.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      notify(`Selamat datang, ${u.name.split(" ")[0]}! 🎉`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="page auth-page">
      <img src="/logo.svg" alt="" width="72" height="72" className="auth-logo" />
      <h1>Daftar Akun</h1>
      <p className="muted center">Cukup beberapa data, langsung bisa jual beli.</p>

      <form className="form-card" onSubmit={submit} noValidate>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="name">Nama lengkap</label>
          <input id="name" autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label htmlFor="rnim">NIM</label>
          <input id="rnim" inputMode="numeric" value={form.nim} onChange={set("nim")} />
        </div>
        <div className="field">
          <label htmlFor="faculty">Fakultas / Prodi (opsional)</label>
          <input id="faculty" value={form.faculty} onChange={set("faculty")} placeholder="Contoh: Teknik Komputer" />
        </div>
        <div className="field">
          <label htmlFor="wa">Nomor WhatsApp (opsional)</label>
          <input id="wa" type="tel" inputMode="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="08123456789" />
          <small className="hint">Dipakai pembeli untuk menghubungimu.</small>
        </div>
        <div className="field">
          <label htmlFor="email">Email (opsional)</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Mendaftarkan…" : "Daftar"}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link to="/login" state={{ from }}>Masuk</Link>
      </p>
    </div>
  );
}
