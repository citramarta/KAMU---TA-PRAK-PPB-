import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { conditionLabel, formatRupiah, initials } from "../utils/format.js";
import { IconHeart, IconImage } from "./Icons.jsx";

// Gambar dengan fallback jika URL kosong / gagal dimuat (mis. saat offline)
export function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="thumb-placeholder" role="img" aria-label={alt}>
        <IconImage size={34} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function ProductCard({ item, compact = false }) {
  const { wishIds, toggleWish, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const wished = wishIds.has(item.id);

  async function onHeart() {
    try {
      const result = await toggleWish(item);
      if (result === "login") {
        notify("Masuk dulu untuk menyimpan ke favorit");
        navigate("/login", { state: { from: location.pathname + location.search } });
      } else {
        notify(result === "added" ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
      }
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <article className={`product-card${compact ? " compact" : ""}`}>
      <Link to={`/barang/${item.id}`} className="product-link">
        <div className="product-thumb">
          <ProductImage src={item.image_url} alt={item.title} />
          <span className={`badge badge-${item.condition}`}>{conditionLabel(item.condition)}</span>
          {item.status === "sold" && <div className="sold-overlay">Terjual</div>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{item.title}</h3>
          <p className="product-price">{formatRupiah(item.price)}</p>
          <p className="product-meta">
            <span className="mini-avatar">{initials(item.seller_name)}</span>
            <span className="truncate">{item.seller_name}</span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        className={`heart-btn${wished ? " active" : ""}`}
        onClick={onHeart}
        aria-pressed={wished}
        aria-label={wished ? "Hapus dari favorit" : "Simpan ke favorit"}
      >
        <IconHeart size={18} filled={wished} />
      </button>
    </article>
  );
}
