import { sql } from "../config/db.js";
import { notFound } from "../utils/handle.js";

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
  async create(b) {
    const rows = await sql`
      INSERT INTO items (title, description, price, condition, condition_note, image_url, category_id, seller_id)
      VALUES (${b.title}, ${b.description ?? null}, ${b.price ?? 0}, ${b.condition ?? "preloved"},
              ${b.condition_note ?? null}, ${b.image_url ?? null}, ${b.category_id ?? null}, ${b.seller_id})
      RETURNING *`;
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
