import { randomUUID } from "node:crypto";
import { sql } from "../config/db.js";
import { HttpError, badRequest, notFound } from "../utils/handle.js";

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

export const ItemModel = {
  // Filter opsional: condition, category_id, seller_id, status, search
  async getAll({ condition, category_id, seller_id, status, search } = {}) {
    const c = condition || null;
    const cat = category_id || null;
    const s = seller_id || null;
    const st = status || null;
    const q = search || null;
    return await sql`
      SELECT i.id, i.title, i.price, i.condition, i.condition_note, i.image_url,
             i.status, i.created_at, i.category_id, i.seller_id,
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
  // b.image_base64 (opsional): foto hasil upload. Jika ada, disimpan di item_images
  // dan image_url diarahkan ke GET /api/items/:id/image
  async create(b) {
    const id = randomUUID();
    const img = parseImage(b.image_base64);
    const imageUrl = img ? `/api/items/${id}/image` : b.image_url ?? null;

    const statements = [
      sql`
        INSERT INTO items (id, title, description, price, condition, condition_note, image_url, category_id, seller_id)
        VALUES (${id}, ${b.title}, ${b.description ?? null}, ${b.price ?? 0}, ${b.condition ?? "preloved"},
                ${b.condition_note ?? null}, ${imageUrl}, ${b.category_id ?? null}, ${b.seller_id})
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
  async getImage(id) {
    const rows = await sql`SELECT content_type, data FROM item_images WHERE item_id = ${id}`;
    if (!rows.length) throw notFound("Foto");
    return rows[0];
  },
  async update(id, b) {
    const rows = await sql`
      UPDATE items SET
        title = COALESCE(${b.title ?? null}, title),
        description = COALESCE(${b.description ?? null}, description),
        price = COALESCE(${b.price ?? null}, price),
        condition = COALESCE(${b.condition ?? null}, condition),
        condition_note = COALESCE(${b.condition_note ?? null}, condition_note),
        image_url = COALESCE(${b.image_url ?? null}, image_url),
        category_id = COALESCE(${b.category_id ?? null}, category_id),
        status = COALESCE(${b.status ?? null}, status)
      WHERE id = ${id} RETURNING *`;
    if (!rows.length) throw notFound("Barang");
    return rows[0];
  },
  async remove(id) {
    const rows = await sql`DELETE FROM items WHERE id = ${id} RETURNING id`;
    if (!rows.length) throw notFound("Barang");
    return { message: "Barang berhasil dihapus" };
  },
};
