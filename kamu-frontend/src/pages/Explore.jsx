import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { EmptyState, ErrorBox, SkeletonGrid } from "../components/States.jsx";
import { IconArrowRight, IconBag, IconSearch, IconX } from "../components/Icons.jsx";

// rentang harga [min, max) untuk filter di sisi aplikasi
const PRICE_RANGES = {
  "": [0, Infinity],
  murah: [0, 50000],
  sedang: [50000, 200000],
  mahal: [200000, Infinity],
};

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const kategori = params.get("kategori") || "";
  const kondisi = params.get("kondisi") || "";
  const penjual = params.get("penjual") || "";
  const namaPenjual = params.get("nama") || "";
  const urut = params.get("urut") || "terbaru";
  const harga = params.get("harga") || "";

  const [search, setSearch] = useState(q);

  const update = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );

  const clearSeller = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("penjual");
        next.delete("nama");
        return next;
      },
      { replace: true }
    );

  // Pencarian ikut berubah setelah berhenti mengetik 400 ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() !== q) update("q", search.trim());
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const cats = useAsync((signal) => api.categories(signal), []);
  const items = useAsync(
    (signal) =>
      api.items(
        { status: "available", condition: kondisi, category_id: kategori, seller_id: penjual, search: q },
        signal
      ),
    [kondisi, kategori, penjual, q]
  );

  const list = useMemo(() => {
    const [min, max] = PRICE_RANGES[harga] || PRICE_RANGES[""];
    const filtered = (items.data || []).filter((i) => {
      const p = Number(i.price);
      return p >= min && p < max;
    });
    if (urut === "termurah") filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (urut === "termahal") filtered.sort((a, b) => Number(b.price) - Number(a.price));
    return filtered;
  }, [items.data, harga, urut]);

  return (
    <div className="page">
      <SearchBar
        value={search}
        onChange={setSearch}
        onSubmit={(v) => update("q", v.trim())}
        placeholder="Cari di KAMU…"
      />
      <Header
        title="Jelajahi"
        subtitle={penjual ? `Barang dari ${namaPenjual || "penjual"}` : "Temukan kebutuhan kuliah dan kosmu."}
      />

      <div className="chip-row" role="group" aria-label="Kategori">
        <button className={`chip${kategori === "" ? " active" : ""}`} onClick={() => update("kategori", "")}>
          Semua
        </button>
        {(cats.data || []).map((c) => (
          <button
            key={c.id}
            className={`chip${kategori === c.id ? " active" : ""}`}
            onClick={() => update("kategori", c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="chip-row" aria-label="Filter">
        {penjual && (
          <button className="chip active" onClick={clearSeller}>
            {namaPenjual || "Penjual"} <IconX size={14} />
          </button>
        )}
        <label className={`pill-select${kondisi ? " active" : ""}`}>
          <span className="sr-only">Kondisi</span>
          <select value={kondisi} onChange={(e) => update("kondisi", e.target.value)}>
            <option value="">Semua kondisi</option>
            <option value="baru">Baru</option>
            <option value="preloved">Preloved</option>
          </select>
        </label>
        <label className={`pill-select${urut !== "terbaru" ? " active" : ""}`}>
          <span className="sr-only">Urutkan</span>
          <select value={urut} onChange={(e) => update("urut", e.target.value === "terbaru" ? "" : e.target.value)}>
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga terendah</option>
            <option value="termahal">Harga tertinggi</option>
          </select>
        </label>
        <label className={`pill-select${harga ? " active" : ""}`}>
          <span className="sr-only">Rentang harga</span>
          <select value={harga} onChange={(e) => update("harga", e.target.value)}>
            <option value="">Semua harga</option>
            <option value="murah">Di bawah Rp50 rb</option>
            <option value="sedang">Rp50 rb – Rp200 rb</option>
            <option value="mahal">Di atas Rp200 rb</option>
          </select>
        </label>
      </div>

      <section className="section grow">
        {items.loading && !items.data ? (
          <SkeletonGrid count={4} />
        ) : items.error && !items.data ? (
          <ErrorBox message={items.error} onRetry={items.reload} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={28} />}
            title="Barang tidak ditemukan"
            text="Coba ubah kata kunci atau filter pencarianmu."
          />
        ) : (
          <>
            <p className="result-count">{list.length} barang</p>
            <ProductGrid items={list} />
          </>
        )}
      </section>

      <div className="sticky-cta">
        <span className="cta-icon">
          <IconBag size={22} />
        </span>
        <div className="cta-text">
          <strong>Punya barang tak terpakai?</strong>
          <small>Jual ke sesama mahasiswa</small>
        </div>
        <Link to="/jual" className="btn btn-primary btn-sm">
          Jual <IconArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
