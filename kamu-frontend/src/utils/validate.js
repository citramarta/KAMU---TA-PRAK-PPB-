// Aturan pengisian barang (dicerminkan di API supaya tidak bisa dilewati).
export const PRICE_MAX = 100_000_000;
export const TITLE_MIN = 3;
export const DESC_MIN = 10;
export const OTHER_MIN = 3;

export const isOtherCategory = (categories, id) =>
  (categories || []).find((c) => c.id === id)?.name?.trim().toLowerCase() === "lainnya";

// strict = true untuk barang yang akan tayang; draf cukup memakai judul.
// Mengembalikan objek { namaField: "pesan" }; kosong berarti valid.
export function validateItem(v, { strict, categories }) {
  const e = {};
  if (v.title.trim().length < TITLE_MIN) e.title = `Judul barang wajib diisi (minimal ${TITLE_MIN} karakter).`;

  const priceFilled = v.price !== "";
  const price = Number(v.price);
  if (strict) {
    if (v.description.trim().length < DESC_MIN) e.description = `Deskripsi wajib diisi (minimal ${DESC_MIN} karakter).`;
    if (!priceFilled || !Number.isFinite(price)) e.price = "Harga wajib diisi.";
    else if (price <= 0) e.price = "Harga harus lebih dari Rp0.";
    else if (price > PRICE_MAX) e.price = "Harga maksimal Rp100.000.000.";
    if (!v.category_id) e.category_id = "Pilih kategori barang.";
    else if (isOtherCategory(categories, v.category_id) && v.category_other.trim().length < OTHER_MIN) {
      e.category_other = `Jelaskan jenis barangnya (minimal ${OTHER_MIN} karakter).`;
    }
  } else if (priceFilled && (!Number.isFinite(price) || price < 0 || price > PRICE_MAX)) {
    e.price = "Harga tidak valid.";
  }
  return e;
}
