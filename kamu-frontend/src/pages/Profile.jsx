import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import { ProductImage } from "../components/ProductCard.jsx";
import { EmptyState, ErrorBox } from "../components/States.jsx";
import { IconBag, IconChevronRight, IconDownload, IconInfo, IconLogout, IconTrash } from "../components/Icons.jsx";
import { formatRupiah, initials } from "../utils/format.js";

function MenuItem({ icon, label, to, onClick, danger }) {
  const body = (
    <>
      <span className={`menu-icon${danger ? " danger" : ""}`}>{icon}</span>
      <span className="menu-label">{label}</span>
      <IconChevronRight size={18} />
    </>
  );
  return to ? (
    <Link to={to} className="menu-item">
      {body}
    </Link>
  ) : (
    <button type="button" className="menu-item" onClick={onClick}>
      {body}
    </button>
  );
}

export default function Profile() {
  const { user, logout, notify, canInstall, installed, install } = useApp();
  const navigate = useNavigate();

  const mine = useAsync(
    (signal) => (user ? api.items({ seller_id: user.id }, signal) : Promise.resolve([])),
    [user?.id]
  );

  async function toggleSold(item) {
    try {
      await api.updateItem(item.id, { status: item.status === "sold" ? "available" : "sold" });
      notify(item.status === "sold" ? "Barang aktif kembali" : "Ditandai terjual");
      mine.reload();
    } catch (err) {
      notify(err.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus "${item.title}"?`)) return;
    try {
      await api.deleteItem(item.id);
      notify("Barang dihapus");
      mine.reload();
    } catch (err) {
      notify(err.message);
    }
  }

  function doLogout() {
    logout();
    notify("Kamu telah keluar");
    navigate("/");
  }

  if (!user) {
    return (
      <div className="page page-narrow">
        <Header title="Profil" subtitle="Masuk untuk mulai berjualan." />
        <div className="guest-card">
          <img src="/logo.svg" alt="" width="64" height="64" />
          <h2>Selamat datang di KAMU</h2>
          <p>Masuk dengan NIM-mu untuk menjual barang dan menyimpan favorit.</p>
          <div className="state-actions">
            <Link to="/login" className="btn btn-primary">
              Masuk
            </Link>
            <Link to="/daftar" className="btn btn-ghost">
              Daftar
            </Link>
          </div>
        </div>
        <div className="menu">
          <MenuItem icon={<IconInfo size={18} />} label="Tentang Aplikasi" to="/tentang" />
          {canInstall && !installed && (
            <MenuItem icon={<IconDownload size={18} />} label="Pasang Aplikasi" onClick={install} />
          )}
        </div>
      </div>
    );
  }

  const items = mine.data || [];

  return (
    <div className="page page-profile">
      <Header title="Profil" />

      <section className="profile-card">
        <span className="avatar avatar-lg">{initials(user.name)}</span>
        <div>
          <h2>{user.name}</h2>
          <p>NIM {user.nim}</p>
          {user.faculty && <p>{user.faculty}</p>}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Barang Saya</h2>
          <Link to="/jual">+ Tambah</Link>
        </div>

        {mine.loading && !mine.data ? (
          <p className="muted">Memuat…</p>
        ) : mine.error && !mine.data ? (
          <ErrorBox message={mine.error} onRetry={mine.reload} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconBag size={28} />}
            title="Belum ada barang"
            text="Yuk jual barang pertamamu."
            action={
              <Link to="/jual" className="btn btn-primary btn-sm">
                Jual Barang
              </Link>
            }
          />
        ) : (
          <ul className="my-items">
            {items.map((item) => (
              <li key={item.id} className="my-item">
                <Link to={`/barang/${item.id}`} className="my-thumb">
                  <ProductImage src={item.image_url} alt={item.title} />
                </Link>
                <div className="my-body">
                  <Link to={`/barang/${item.id}`} className="my-title">
                    {item.title}
                  </Link>
                  <p className="my-price">
                    {formatRupiah(item.price)}
                    <span className={`status status-${item.status}`}>
                      {item.status === "sold" ? "Terjual" : "Aktif"}
                    </span>
                  </p>
                  <div className="my-actions">
                    <button className="btn btn-ghost btn-xs" onClick={() => toggleSold(item)}>
                      {item.status === "sold" ? "Aktifkan lagi" : "Tandai terjual"}
                    </button>
                    <button className="btn btn-danger btn-xs" onClick={() => remove(item)} aria-label={`Hapus ${item.title}`}>
                      <IconTrash size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="menu">
        <MenuItem icon={<IconInfo size={18} />} label="Tentang Aplikasi" to="/tentang" />
        {canInstall && !installed && (
          <MenuItem icon={<IconDownload size={18} />} label="Pasang Aplikasi" onClick={install} />
        )}
        <MenuItem icon={<IconLogout size={18} />} label="Keluar" onClick={doLogout} danger />
      </div>
    </div>
  );
}
