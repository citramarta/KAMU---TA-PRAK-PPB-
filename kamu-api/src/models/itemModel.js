import { randomUUID } from "node:crypto";
import { sql } from "../config/db.js";
import { HttpError, badRequest, notFound } from "../utils/handle.js";

// ---------------------------------------------------------------------------
// Aturan data barang
// ---------------------------------------------------------------------------
const STATUSES = ["available", "sold", "draft", "archived"];
const CONDITIONS = ["baru", "preloved"];
const PRICE_MAX = 100_000_000;

// ---- Foto barang (disimpan di tabel item_images sebagai base64) ----
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BASE64_LENGTH = 1_500_000; // sekitar 1,1 MB setelah di-decode

// Menerima data URL ("data:image/jpeg;base64,....") atau base64 polos
function parseImage(input) {
  if (!input) return null;
  const match = /^data:(image\/[a-z+.-]+);base64,([\s\S]+)$/i.exec(input);
  const type = match ? match[1].toLowerCase() : "image/jpeg";
  const data = (match ? match[2] : input).replace(/\s/g, "");
  if (!ALLOWED_TYPES.includes(type)) throw badRequest("Format foto harus JPG, PNG, atau WebP");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw badRequest("Data foto tidak valid");
  if (data.length > MAX_BASE64_LENGTH) throw new HttpError(413, "Ukuran foto terlalu besar");
  return { type, data };
}

const text = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

// Merapikan input menjadi bentuk yang siap disimpan
function normalize(b) {
  const price = b.price === "" || b.price == null ? 0 : Number(b.price);
  const condition = b.condition ?? "preloved";
  if (!CONDITIONS.includes(condition)) throw badRequest("Kondisi harus 'baru' atau 'preloved'");
  if (!Number.isFinite(price) || price < 0) throw badRequest("Harga tidak valid");
  return {
    title: text(b.title),
    description: text(b.description) || null,
    price,
    condition,
    condition_note: text(b.condition_note) || null,
    image_url: text(b.image_url) || null,
    category_id: b.category_id || null,
    category_other: text(b.category_other) || null,
    seller_id: b.seller_id,
  };
}

async function categoryName(id) {
  if (!id) return null;
  const rows = await sql`SELECT name FROM categories WHERE id = ${id}`;
  return rows[0]?.name ?? null;
}

// strict = true untuk barang yang akan tayang (aktif); draf cukup memakai judul
async function validate(m, { strict }) {
  const errors = [];
  if (m.title.length < 3) errors.push("Judul barang wajib diisi (minimal 3 karakter)");
  if (m.title.length > 120) errors.push("Judul maksimal 120 karakter");
  if (m.description && m.description.length > 2000) errors.push("Deskripsi maksimal 2000 karakter");
  if (m.condition_note && m.condition_note.length > 80) errors.push("Keterangan kondisi maksimal 80 karakter");
  if (m.price > PRICE_MAX) errors.push("Harga maksimal Rp100.000.000");

  if (strict) {
    if (!m.description || m.description.length < 10) errors.push("Deskripsi wajib diisi (minimal 10 karakter)");
    if (m.price <= 0) errors.push("Harga harus lebih dari Rp0");
    if (!m.category_id) {
      errors.push("Kategori wajib dipilih");
    } else if ((await categoryName(m.category_id))?.toLowerCase() === "lainnya") {
      if (!m.category_other || m.category_other.length < 3) {
        errors.push("Jelaskan jenis barang untuk kategori Lainnya (minimal 3 karakter)");
      }
    }
  }
  if (errors.length) throw badRequest(errors.join(". "));

  // Keterangan "Lainnya" hanya disimpan jika kategorinya memang Lainnya
  if (m.category_other && (await categoryName(m.category_id))?.toLowerCase() !== "lainnya") {
    m.category_other = null;
  }
}

async function findOwned(id, seller_id) {
  const rows = await sql`SELECT * FROM items WHERE id = ${id}`;
  if (!rows.length) throw notFound("Barang");
  if (!seller_id || rows[0].seller_id !== seller_id) {
    throw new HttpError(403, "Kamu tidak berhak mengubah barang ini");
  }
  return rows[0];
}

export const ItemModel = {
  // Filter opsional: condition, category_id, seller_id, status, search.
  // Tanpa filter status dan tanpa seller_id, hanya barang aktif yang dikembalikan
  // (draf dan arsip tidak tampil ke publik).
  async getAll({ condition, category_id, seller_id, status, search } = {}) {
    const c = condition || null;
    const cat = category_id || null;
    const s = seller_id || null;
    const st = status || (seller_id ? null : "available");
    const q = search || null;
    return await sql`
      SELECT i.id, i.title, i.price, i.condition, i.condition_note, i.image_url,
             i.status, i.created_at, i.category_id, i.category_other, i.seller_id,
             c.name AS category_name, u.name AS seller_name
      FROM items i
      LEFT JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.seller_id
      WHERE (${c}::text IS NULL OR i.condition = ${c}::text)
        AND (${cat}::uuid IS NULL OR i.category_id = ${cat}::uuid)
        AND (${s}::uuid IS NULL OR i.seller_id = ${s}::uuid)
        AND (${st}::text IS NULL OR i.status = ${st}::text)
        AND (${q}::text IS NULL OR i.title ILIKE '%' || ${q}::text || '%')
      ORDER BY i.created_at DESC`;
  },

  // Detail lengkap + info penjual & kategori
  async getById(id) {
    const rows = await sql`
      SELECT i.*, c.name AS category_name,
             u.name AS seller_name, u.nim AS seller_nim,
             u.faculty AS seller_faculty, u.whatsapp AS seller_whatsapp
      FROM items i
      LEFT JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.seller_id
      WHERE i.id = ${id}`;
    if (!rows.length) throw notFound("Barang");
    return rows[0];
  },

  // b.status = "draft" menyimpan sebagai draf; selain itu langsung tayang (aktif)
  // b.image_base64 (opsional): foto hasil upload, disimpan di item_images
  async create(b) {
    if (!b.seller_id) throw badRequest("seller_id wajib diisi");
    const status = b.status === "draft" ? "draft" : "available";
    const m = normalize(b);
    await validate(m, { strict: status === "available" });

    const id = randomUUID();
    const img = parseImage(b.image_base64);
    const imageUrl = img ? `/api/items/${id}/image` : m.image_url;

    const statements = [
      sql`
        INSERT INTO items (id, title, description, price, condition, condition_note, image_url,
                           category_id, category_other, seller_id, status)
        VALUES (${id}, ${m.title}, ${m.description}, ${m.price}, ${m.condition}, ${m.condition_note},
                ${imageUrl}, ${m.category_id}, ${m.category_other}, ${m.seller_id}, ${status})
        RETURNING *`,
    ];
    if (img) {
      statements.push(
        sql`INSERT INTO item_images (item_id, content_type, data) VALUES (${id}, ${img.type}, ${img.data})`
      );
    }
    // transaksi: barang dan fotonya tersimpan bersama atau tidak sama sekali
    const results = await sql.transaction(statements);
    return results[0][0];
  },

  // Hanya pemilik (b.seller_id harus sama). Field yang tidak dikirim tetap seperti semula.
  // Opsional: b.image_base64 (ganti foto), b.remove_image = true (hapus foto)
  async update(id, b) {
    const cur = await findOwned(id, b.seller_id);

    const status = b.status ?? cur.status;
    if (!STATUSES.includes(status)) throw badRequest("Status tidak valid");

    const contentKeys = ["title", "description", "price", "condition", "condition_note", "category_id", "category_other"];
    const img = parseImage(b.image_base64);
    const touchesContent = contentKeys.some((k) => k in b) || Boolean(img) || Boolean(b.remove_image);

    const m = normalize({ ...cur, ...b });
    // Barang yang tayang (baru diterbitkan atau isinya diubah) harus lengkap.
    // Mengarsipkan / menandai terjual tidak perlu mengubah data lama.
    const strict = status === "available" && (cur.status !== "available" || touchesContent);
    await validate(m, { strict });

    let imageUrl = m.image_url;
    if (img) imageUrl = `/api/items/${id}/image?v=${Date.now()}`; // ?v= agar cache foto lama tidak dipakai
    else if (b.remove_image) imageUrl = null;

    const statements = [
      sql`
        UPDATE items SET
          title = ${m.title}, description = ${m.description}, price = ${m.price},
          condition = ${m.condition}, condition_note = ${m.condition_note}, image_url = ${imageUrl},
          category_id = ${m.category_id}, category_other = ${m.category_other}, status = ${status}
        WHERE id = ${id}
        RETURNING *`,
    ];
    if (img) {
      statements.push(sql`
        INSERT INTO item_images (item_id, content_type, data) VALUES (${id}, ${img.type}, ${img.data})
        ON CONFLICT (item_id) DO UPDATE SET content_type = EXCLUDED.content_type, data = EXCLUDED.data`);
    } else if (b.remove_image) {
      statements.push(sql`DELETE FROM item_images WHERE item_id = ${id}`);
    }
    const results = await sql.transaction(statements);
    return results[0][0];
  },

  // Hanya pemilik (seller_id dikirim lewat query ?seller_id=)
  async remove(id, seller_id) {
    await findOwned(id, seller_id);
    await sql`DELETE FROM items WHERE id = ${id}`;
    return { message: "Barang berhasil dihapus" };
  },

  async getImage(id) {
    const rows = await sql`SELECT content_type, data FROM item_images WHERE item_id = ${id}`;
    if (!rows.length) throw notFound("Foto");
    return rows[0];
  },
};
