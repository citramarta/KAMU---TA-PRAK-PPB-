import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { useApp } from "../context/AppContext.jsx";
import { ProductImage } from "../components/ProductCard.jsx";
import { ErrorBox, Loader } from "../components/States.jsx";
import { IconArrowLeft, IconChat, IconHeart } from "../components/Icons.jsx";
import { conditionLabel, formatDate, formatRupiah, initials, timeAgo, toWaNumber } from "../utils/format.js";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishIds, toggleWish, notify } = useApp();
  const { data: item, loading, error, reload } = useAsync((signal) => api.item(id, signal), [id]);

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));

  if (loading && !item) {
    return (
      <div className="page">
        <Loader text="Memuat detail barang…" />
      </div>
    );
  }
  if (error && !item) {
    return (
      <div className="page">
        <button className="icon-btn" onClick={goBack} aria-label="Kembali">
          <IconArrowLeft size={22} />
        </button>
        <ErrorBox message={error} onRetry={reload} />
      </div>
    );
  }

  const wished = wishIds.has(item.id);
  const isOwner = user?.id === item.seller_id;
  const sold = item.status === "sold";
  const wa = toWaNumber(item.seller_whatsapp);
  const waText = `Halo ${item.seller_name}, aku tertarik dengan "${item.title}" di KAMU. Apakah masih tersedia?`;

  async function onHeart() {
    try {
      const result = await toggleWish(item);
      if (result === "login") {
        notify("Masuk dulu untuk menyimpan ke favorit");
        navigate("/login", { state: { from: `/barang/${id}` } });
      } else {
        notify(result === "added" ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
      }
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <div className="page page-flush">
      <div className="detail-hero">
        <ProductImage src={item.image_url} alt={item.title} />
        <button className="float-btn left" onClick={goBack} aria-label="Kembali">
          <IconArrowLeft size={20} />
        </button>
        <button
          className={`float-btn right${wished ? " active" : ""}`}
          onClick={onHeart}
          aria-pressed={wished}
          aria-label={wished ? "Hapus dari favorit" : "Simpan ke favorit"}
        >
          <IconHeart size={20} filled={wished} />
        </button>
        <span className={`badge badge-${item.condition} badge-lg`}>{conditionLabel(item.condition)}</span>
        {sold && <div className="sold-overlay">Terjual</div>}
      </div>

      <div className="detail-sheet">
        <p className="detail-kicker">
          {item.category_name || "Lainnya"}
          {item.condition_note ? ` • ${item.condition_note}` : ""}
        </p>
        <h1 className="detail-title">{item.title}</h1>
        <p className="detail-price">{formatRupiah(item.price)}</p>

        <dl className="spec-grid">
          <div>
            <dt>Kondisi</dt>
            <dd>{conditionLabel(item.condition)}</dd>
          </div>
          <div>
            <dt>Kategori</dt>
            <dd>{item.category_name || "Lainnya"}</dd>
          </div>
          <div>
            <dt>Diposting</dt>
            <dd title={formatDate(item.created_at)}>{timeAgo(item.created_at)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{sold ? "Terjual" : "Tersedia"}</dd>
          </div>
        </dl>

        <h2 className="detail-h2">Deskripsi</h2>
        <p className="detail-desc">{item.description || "Penjual belum menambahkan deskripsi."}</p>

        <section className="seller-card" aria-label="Penjual">
          <span className="avatar">{initials(item.seller_name)}</span>
          <div className="seller-info">
            <strong>{item.seller_name}</strong>
            <small>{item.seller_faculty || "Mahasiswa"}</small>
          </div>
          <Link
            to={`/jelajah?penjual=${item.seller_id}&nama=${encodeURIComponent(item.seller_name)}`}
            className="btn btn-ghost btn-sm"
          >
            Barang lain
          </Link>
        </section>

        <p className="tip">
          Tips aman: ketemuan (COD) di area kampus yang ramai dan cek barang sebelum membayar.
        </p>
      </div>

      <div className="sticky-cta detail-cta">
        <div className="cta-text">
          <small>Harga</small>
          <strong className="cta-price">{formatRupiah(item.price)}</strong>
        </div>
        {isOwner ? (
          <Link to="/profil" className="btn btn-ghost">
            Ini barangmu
          </Link>
        ) : sold ? (
          <button className="btn btn-primary" disabled>
            Sudah terjual
          </button>
        ) : wa ? (
          <a
            className="btn btn-primary"
            href={`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconChat size={18} />
            Hubungi Penjual
          </a>
        ) : (
          <button className="btn btn-primary" disabled>
            Kontak belum tersedia
          </button>
        )}
      </div>
    </div>
  );
}
