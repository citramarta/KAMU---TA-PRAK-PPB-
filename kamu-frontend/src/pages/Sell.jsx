import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import { LoginPrompt } from "../components/States.jsx";
import { IconX } from "../components/Icons.jsx";
import { compressImage, formatBytes } from "../utils/image.js";
import "./Sell.css";

const EMPTY = {
  title: "",
  price: "",
  condition: "preloved",
  condition_note: "",
  category_id: "",
  description: "",
};

export default function Sell() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const cats = useAsync((signal) => api.categories(signal), []);
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null); // { dataUrl, bytes }
  const [photoBusy, setPhotoBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!user) {
    return (
      <div className="page page-narrow">
        <Header title="Jual Barang" subtitle="Posting barangmu ke sesama mahasiswa." />
        <LoginPrompt text="Masuk dengan NIM-mu untuk mulai menjual barang." />
      </div>
    );
  }

  // Foto dipilih (klik atau seret) -> diperkecil di browser sebelum diunggah
  async function handleFile(file) {
    setError("");
    setPhotoBusy(true);
    try {
      setPhoto(await compressImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  }

  function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya foto yang sama bisa dipilih lagi
    if (file) handleFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const price = Number(form.price);
    if (!form.title.trim()) return setError("Nama barang wajib diisi.");
    if (form.price === "" || !Number.isFinite(price) || price < 0) return setError("Harga tidak valid.");
    if (photoBusy) return setError("Tunggu sebentar, foto sedang diproses.");

    setBusy(true);
    try {
      const created = await api.createItem({
        title: form.title.trim(),
        price,
        condition: form.condition,
        condition_note: form.condition_note.trim() || null,
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        image_base64: photo ? photo.dataUrl : undefined,
        seller_id: user.id,
      });
      notify("Barang berhasil diposting 🎉");
      navigate(`/barang/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-narrow">
      <Header title="Jual Barang" subtitle="Posting barangmu ke sesama mahasiswa." />

      <form className="form-card" onSubmit={submit} noValidate>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <span className="label" id="photo-label">
            Foto barang
          </span>
          {photo ? (
            <div className="photo-preview">
              <img src={photo.dataUrl} alt="Pratinjau foto barang" />
              <button type="button" className="photo-remove" onClick={() => setPhoto(null)} aria-label="Hapus foto">
                <IconX size={18} />
              </button>
              <label className="btn btn-light btn-sm photo-change">
                Ganti foto
                <input type="file" accept="image/*" className="sr-only" onChange={onPick} />
              </label>
              <span className="photo-size">{formatBytes(photo.bytes)}</span>
            </div>
          ) : (
            <label
              className={`photo-drop${dragging ? " dragging" : ""}${photoBusy ? " busy" : ""}`}
              aria-labelledby="photo-label"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {photoBusy ? (
                <>
                  <span className="spinner" />
                  <strong>Memproses foto…</strong>
                </>
              ) : (
                <>
                  <span className="photo-emoji" aria-hidden="true">
                    📷
                  </span>
                  <strong>Tambah foto barang</strong>
                  <small>Pilih dari galeri atau ambil dengan kamera</small>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={onPick} disabled={photoBusy} />
            </label>
          )}
          <small className="hint">Barang dengan foto lebih cepat laku.</small>
        </div>

        <div className="field">
          <span className="label">Kondisi barang</span>
          <div className="segmented" role="radiogroup" aria-label="Kondisi barang">
            {[
              ["preloved", "Preloved"],
              ["baru", "Baru"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                role="radio"
                aria-checked={form.condition === value}
                className={form.condition === value ? "active" : ""}
                onClick={() => setForm((f) => ({ ...f, condition: value }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="title">Nama barang</label>
          <input id="title" value={form.title} onChange={set("title")} placeholder="Contoh: Kalkulus Edisi 9" maxLength={120} />
        </div>

        <div className="field">
          <label htmlFor="price">Harga (Rp)</label>
          <input id="price" type="number" inputMode="numeric" min="0" value={form.price} onChange={set("price")} placeholder="85000" />
        </div>

        <div className="field">
          <label htmlFor="category">Kategori</label>
          <select id="category" value={form.category_id} onChange={set("category_id")}>
            <option value="">Pilih kategori</option>
            {(cats.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="note">Keterangan kondisi (opsional)</label>
          <input id="note" value={form.condition_note} onChange={set("condition_note")} placeholder="Contoh: Like new, pemakaian 1 semester" maxLength={80} />
        </div>

        <div className="field">
          <label htmlFor="desc">Deskripsi</label>
          <textarea id="desc" rows="4" value={form.description} onChange={set("description")} placeholder="Ceritakan kondisi, kelengkapan, dan alasan menjual." />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy || photoBusy}>
          {busy ? "Memposting…" : "Posting Barang"}
        </button>
      </form>
    </div>
  );
}
