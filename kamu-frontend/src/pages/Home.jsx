
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { EmptyState, ErrorBox, SkeletonGrid } from "../components/States.jsx";
import { IconArrowRight, IconBag, IconPin, IconShield, IconTag, IconWallet } from "../components/Icons.jsx";

const SLIDES = [
  {
    key: "jelajah",
    title: ["Barang Kampus,", "Harga Mahasiswa."],
    text: "Beli dan jual barang baru atau preloved sesama mahasiswa.",
    cta: "Jelajahi Sekarang",
    to: "/jelajah",
  },
  {
    key: "preloved",
    title: ["Preloved Berkualitas,", "Dompet Tetap Aman."],
    text: "Buku kuliah, laptop, hingga perlengkapan kos.",
    cta: "Lihat Preloved",
    to: "/jelajah?kondisi=preloved",
  },
  {
    key: "jual",
    title: ["Punya Barang", "Tak Terpakai?"],
    text: "Ubah jadi uang saku dalam beberapa menit.",
    cta: "Mulai Jual",
    to: "/jual",
  },
];

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="96" cy="78" r="60" fill="#F4B6C6" opacity=".25" />
      <path d="M74 62v-8a18 18 0 0 1 36 0v8" fill="none" stroke="#F8F4EC" strokeWidth="7" strokeLinecap="round" />
      <rect x="52" y="62" width="84" height="76" rx="14" fill="#F8F4EC" />
      <circle cx="94" cy="98" r="19" fill="#F4B6C6" />
      <path d="M94 108s-10.5-6.2-10.5-13a5.6 5.6 0 0 1 10.5-2.8A5.6 5.6 0 0 1 104.5 95c0 6.8-10.5 13-10.5 13z" fill="#1F4D3A" />
      <rect x="18" y="104" width="40" height="26" rx="8" fill="#F4B6C6" transform="rotate(-12 38 117)" />
      <circle cx="29" cy="111" r="3.2" fill="#1F4D3A" />
    </svg>
  );
}

function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((n) => (n + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Promo KAMU">
      <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SLIDES.map((s, n) => (
          <div className="hero-slide" key={s.key} aria-hidden={n !== index}>
            <div className="hero-copy">
              <h2>
                {s.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p>{s.text}</p>
              <Link to={s.to} className="btn btn-light btn-sm" tabIndex={n === index ? 0 : -1}>
                {s.cta}
                <IconArrowRight size={16} />
              </Link>
            </div>
            <HeroArt />
          </div>
        ))}
      </div>
      <div className="hero-dots">
        {SLIDES.map((s, n) => (
          <button
            key={s.key}
            className={n === index ? "active" : ""}
            onClick={() => setIndex(n)}
            aria-label={`Tampilkan slide ${n + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { Icon: IconShield, title: "Khusus Mahasiswa", sub: "Sesama kampus" },
  { Icon: IconPin, title: "COD di Kampus", sub: "Ketemuan aman" },
  { Icon: IconWallet, title: "Harga Hemat", sub: "Baru & preloved" },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const cats = useAsync((signal) => api.categories(signal), []);
  const items = useAsync(
    (signal) => api.items({ status: "available", category_id: category }, signal),
    [category]
  );

  const all = items.data || [];
  const latest = all.slice(0, 12);
  const preloved = all.filter((i) => i.condition === "preloved").slice(0, 12);
  const seeAll = category ? `/jelajah?kategori=${category}` : "/jelajah";

  const submitSearch = (value) => {
    const q = value.trim();
    navigate(q ? `/jelajah?q=${encodeURIComponent(q)}` : "/jelajah");
  };

  return (
    <div className="page">
      <Header variant="brand" />
      <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} filterTo="/jelajah" />

      <div className="chip-row" role="group" aria-label="Kategori">
        <button className={`chip${category === "" ? " active" : ""}`} onClick={() => setCategory("")}>
          Semua
        </button>
        {(cats.data || []).map((c) => (
          <button
            key={c.id}
            className={`chip${category === c.id ? " active" : ""}`}
            onClick={() => setCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="hero-wrap">
        <HeroBanner />
        <div className="promo-tiles">
          <Link to="/jual" className="promo-tile promo-pink">
            <span className="promo-icon">
              <IconBag size={22} />
            </span>
            <strong>Jual barangmu</strong>
            <small>Posting gratis, langsung ke sesama mahasiswa.</small>
          </Link>
          <Link to="/jelajah?kondisi=baru" className="promo-tile promo-green">
            <span className="promo-icon">
              <IconTag size={22} />
            </span>
            <strong>Barang baru</strong>
            <small>Merchandise, alat tulis, dan perlengkapan kuliah.</small>
          </Link>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Barang Terbaru</h2>
          <Link to={seeAll}>Lihat semua</Link>
        </div>
        {items.loading && !items.data ? (
          <SkeletonGrid count={2} />
        ) : items.error && !items.data ? (
          <ErrorBox message={items.error} onRetry={items.reload} />
        ) : latest.length === 0 ? (
          <EmptyState
            title="Belum ada barang"
            text="Jadilah yang pertama menjual di KAMU!"
            action={
              <Link to="/jual" className="btn btn-primary btn-sm">
                Jual Barang
              </Link>
            }
          />
        ) : (
          <ProductGrid items={latest} variant="row" className="limit" />
        )}
      </section>

      {preloved.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Preloved Pilihan</h2>
            <Link to="/jelajah?kondisi=preloved">Lihat semua</Link>
          </div>
          <ProductGrid items={preloved} className="limit" />
        </section>
      )}

      <div className="features" aria-label="Keunggulan KAMU">
        {FEATURES.map(({ Icon, title, sub }) => (
          <div className="feature" key={title}>
            <span className="feature-icon">
              <Icon size={18} />
            </span>
            <strong>{title}</strong>
            <small>{sub}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
