import { sql } from "../config/db.js";
import { notFound } from "../utils/handle.js";

export const CategoryModel = {
  async getAll() {
    return await sql`SELECT * FROM categories ORDER BY name`;
  },
  async getById(id) {
    const rows = await sql`SELECT * FROM categories WHERE id = ${id}`;
    if (!rows.length) throw notFound("Kategori");
    return rows[0];
  },
  async create(name) {
    const rows = await sql`INSERT INTO categories (name) VALUES (${name}) RETURNING *`;
    return rows[0];
  },
  async update(id, name) {
    const rows = await sql`UPDATE categories SET name = ${name} WHERE id = ${id} RETURNING *`;
    if (!rows.length) throw notFound("Kategori");
    return rows[0];
  },
  async remove(id) {
    const rows = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`;
    if (!rows.length) throw notFound("Kategori");
    return { message: "Kategori berhasil dihapus" };
  },
};
