import { sql } from "../config/db.js";
import { notFound } from "../utils/handle.js";

export const UserModel = {
  async getAll() {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
  },
  // Profil + jumlah barang yang sedang dijual
  async getById(id) {
    const rows = await sql`
      SELECT u.*,
        (SELECT COUNT(*)::int FROM items i WHERE i.seller_id = u.id AND i.status = 'available') AS active_items
      FROM users u WHERE u.id = ${id}`;
    if (!rows.length) throw notFound("User");
    return rows[0];
  },
  async getByNim(nim) {
    const rows = await sql`SELECT * FROM users WHERE nim = ${nim}`;
    if (!rows.length) throw notFound("User dengan NIM tersebut");
    return rows[0];
  },
  async create({ name, nim, faculty, whatsapp, email }) {
    const rows = await sql`
      INSERT INTO users (name, nim, faculty, whatsapp, email)
      VALUES (${name}, ${nim}, ${faculty ?? null}, ${whatsapp ?? null}, ${email ?? null})
      RETURNING *`;
    return rows[0];
  },
  async update(id, { name, faculty, whatsapp, email }) {
    const rows = await sql`
      UPDATE users SET
        name = COALESCE(${name ?? null}, name),
        faculty = COALESCE(${faculty ?? null}, faculty),
        whatsapp = COALESCE(${whatsapp ?? null}, whatsapp),
        email = COALESCE(${email ?? null}, email)
      WHERE id = ${id} RETURNING *`;
    if (!rows.length) throw notFound("User");
    return rows[0];
  },
  async remove(id) {
    const rows = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    if (!rows.length) throw notFound("User");
    return { message: "User berhasil dihapus" };
  },
};
