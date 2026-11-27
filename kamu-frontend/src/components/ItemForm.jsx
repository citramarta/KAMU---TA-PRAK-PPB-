import { useState } from "react";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { compressImage, formatBytes } from "../utils/image.js";
import { formatRupiah } from "../utils/format.js";
import { DESC_MIN, isOtherCategory, validateItem } from "../utils/validate.js";
import { ProductImage } from "./ProductCard.jsx";
import { IconX } from "./Icons.jsx";

const fromItem = (item) => ({
  title: item?.title ?? "",
  description: item?.description ?? "",
  price: item && Number(item.price) > 0 ? String(Math.round(Number(item.price))) : "",
  condition: item?.condition ?? "preloved",
  condition_note: item?.condition_note ?? "",
  category_id: item?.category_id ?? "",
  category_other: item?.category_other ?? "",
});

// Formulir bersama untuk menambah dan mengedit barang.
// onSubmit(payload, intent) -> intent: "publish" | "draft" | "save"
export default function ItemForm({ mode, item, sellerId, onSubmit }) {
  const isEdit = mode === "edit";
  const isDraft = isEdit && item?.status === "draft";

  const cats = useAsync((signal) => api.categories(signal), []);
  const categories = cats.data || [];

  const [form, setForm] = useState(() => fromItem(item));
  const [photo, setPhoto] = useState(null); // foto baru: { dataUrl, bytes }
  const [removeImage, setRemoveImage] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState("");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const setPrice = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10); // hanya angka (tanpa minus/desimal)
    setForm((f) => ({ ...f, price: digits.replace(/^0+(?=\d)/, "") }));
    if (errors.price) setErrors((er) => ({ ...er, price: undefined }));
  };

  const showOther = isOtherCategory(categories, form.category_id);
  const existingImage = isEdit && !removeImage ? item?.image_url : null;
  const shownImage = photo ? photo.dataUrl : existingImage;

  async function handleFile(file) {
    setFormError("");
    setPhotoBusy(true);
    try {
      setPhoto(await compressImage(file));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  }
  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };
  const clearPhoto = () => {
    setPhoto(null);
    if (isEdit && item?.image_url) setRemoveImage(true);
  };

  async function submit(intent) {
    setFormError("");
    if (photoBusy) return setFormError("Tunggu sebentar, foto sedang diproses.");

    // Barang yang tayang harus lengkap; draf cukup judul
    const strict = intent === "publish" || (intent === "save" && item?.status === "available");
    const found = validateItem(form, { strict, categories });
    setErrors(found);
    const firstKey = ["title", "price", "category_id", "category_other", "description"].find((k) => found[k]);
    if (firstKey) {
      const id = { title: "title", price: "price", category_id: "category", category_other: "other", description: "desc" }[firstKey];
      document.getElementById(id)?.focus();
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price === "" ? 0 : Number(form.price),
      condition: form.condition,
      condition_note: form.condition_note.trim(),
      category_id: form.category_id || null,
      category_other: showOther ? form.category_other.trim() : "",
      seller_id: sellerId,
    };
    if (photo) payload.image_base64 = photo.dataUrl;
    else if (removeImage) payload.remove_image = true;
    if (intent === "publish") payload.status = "available";
    if (intent === "draft") payload.status = "draft";

    setBusy(intent);
    try {
      await onSubmit(payload, intent);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy("");
    }
  }

  const err = (key, id) => ({
    "aria-invalid": errors[key] ? "true" : undefined,
    "aria-describedby": errors[key] ? `${id}-err` : undefined,
  });
  const ErrorText = ({ k, id }) =>
    errors[k] ? (
      <small className="field-error" id={`${id}-err`} role="alert">
        {errors[k]}
      </small>
    ) : null;

  const priceNumber = Number(form.price);

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        submit(isDraft || !isEdit ? "publish" : "save");
      }}
      noValidate
    >
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}
      {isDraft && (
        <p className="status-note">Barang ini masih berupa draf dan belum tampil di katalog. Lengkapi lalu terbitkan.</p>
      )}

      {/* ---- Foto ---- */}
      <div className="field">
        <span className="label" id="photo-label">
          Foto barang
        </span>
        {shownImage ? (
          <div className="photo-preview">
            <ProductImage key={shownImage.slice(0, 80)} src={shownImage} alt="Foto barang" />
            <button type="button" className="photo-remove" onClick={clearPhoto} aria-label="Hapus foto">
              <IconX size={18} />
            </button>
            <label className="btn btn-light btn-sm photo-change">
              Ganti foto
              <input type="file" accept="image/*" className="sr-only" onChange={onPick} />
            </label>
            {photo && <span className="photo-size">{formatBytes(photo.bytes)}</span>}
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

      {/* ---- Kondisi ---- */}
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

      {/* ---- Judul ---- */}
      <div className="field">
        <label htmlFor="title">
          Judul barang<span className="req">*</span>
        </label>
        <input id="title" value={form.title} onChange={set("title")} placeholder="Contoh: Kalkulus Edisi 9 - James Stewart" maxLength={120} {...err("title", "title")} />
        <ErrorText k="title" id="title" />
      </div>

      {/* ---- Harga ---- */}
      <div className="field">
        <label htmlFor="price">
          Harga (Rp)<span className="req">*</span>
        </label>
        <input id="price" type="text" inputMode="numeric" autoComplete="off" value={form.price} onChange={setPrice} placeholder="85000" {...err("price", "price")} />
        <div className="field-meta">
          <span>{priceNumber > 0 ? <span className="price-preview">{formatRupiah(priceNumber)}</span> : "Isi harga dalam rupiah, tanpa titik."}</span>
        </div>
        <ErrorText k="price" id="price" />
      </div>

      {/* ---- Kategori ---- */}
      <div className="field">
        <label htmlFor="category">
          Kategori<span className="req">*</span>
        </label>
        <select id="category" value={form.category_id} onChange={set("category_id")} {...err("category_id", "category")}>
          <option value="">Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ErrorText k="category_id" id="category" />
      </div>

      {showOther && (
        <div className="field field-reveal">
          <label htmlFor="other">
            Barang ini berupa apa?<span className="req">*</span>
          </label>
          <input id="other" value={form.category_other} onChange={set("category_other")} placeholder="Contoh: Sepeda lipat, matras yoga, alat musik" maxLength={60} {...err("category_other", "other")} />
          <small className="hint">Karena kamu memilih kategori Lainnya, sebutkan jenis barangnya.</small>
          <ErrorText k="category_other" id="other" />
        </div>
      )}

      {/* ---- Keterangan kondisi ---- */}
      <div className="field">
        <label htmlFor="note">Keterangan kondisi (opsional)</label>
        <input id="note" value={form.condition_note} onChange={set("condition_note")} placeholder="Contoh: Like new, pemakaian 1 semester" maxLength={80} />
      </div>

      {/* ---- Deskripsi ---- */}
      <div className="field">
        <label htmlFor="desc">
          Deskripsi<span className="req">*</span>
        </label>
        <textarea id="desc" rows="5" value={form.description} onChange={set("description")} maxLength={2000} placeholder="Ceritakan kondisi, kelengkapan, dan alasan menjual." {...err("description", "desc")} />
        <div className="field-meta">
          <span>Minimal {DESC_MIN} karakter</span>
          <span>{form.description.trim().length}/2000</span>
        </div>
        <ErrorText k="description" id="desc" />
      </div>

      {/* ---- Tombol ---- */}
      <div className="form-actions">
        {!isEdit && (
          <>
            <button className="btn btn-primary btn-block" type="submit" disabled={Boolean(busy) || photoBusy}>
              {busy === "publish" ? "Memposting…" : "Posting Barang"}
            </button>
            <button className="btn btn-ghost btn-block" type="button" disabled={Boolean(busy) || photoBusy} onClick={() => submit("draft")}>
              {busy === "draft" ? "Menyimpan…" : "Simpan sebagai Draf"}
            </button>
          </>
        )}
        {isDraft && (
          <>
            <button className="btn btn-primary btn-block" type="submit" disabled={Boolean(busy) || photoBusy}>
              {busy === "publish" ? "Menerbitkan…" : "Terbitkan Barang"}
            </button>
            <button className="btn btn-ghost btn-block" type="button" disabled={Boolean(busy) || photoBusy} onClick={() => submit("draft")}>
              {busy === "draft" ? "Menyimpan…" : "Simpan Draf"}
            </button>
          </>
        )}
        {isEdit && !isDraft && (
          <button className="btn btn-primary btn-block" type="submit" disabled={Boolean(busy) || photoBusy}>
            {busy ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        )}
      </div>
    </form>
  );
}
