import { sql } from "../config/db.js";
import { notFound } from "../utils/handle.js";

export const WishlistModel = {
  // Daftar barang yang disimpan satu user (bentuknya mirip list item supaya UI bisa dipakai ulang)
  async getByUser(user_id) {
    return await sql`
      SELECT w.id AS wishlist_id, i.id, i.title, i.price, i.condition, i.condition_note,
             i.image_url, i.status, c.name AS category_name, u.name AS seller_name
      FROM wishlists w
      JOIN items i ON i.id = w.item_id
      LEFT JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.seller_id
      WHERE w.user_id = ${user_id} AND i.status IN ('available', 'sold')
      ORDER BY w.created_at DESC`;
  },
  // Idempotent: menambah barang yang sudah ada di wishlist tidak error
  async add(user_id, item_id) {
    const rows = await sql`
      INSERT INTO wishlists (user_id, item_id) VALUES (${user_id}, ${item_id})
      ON CONFLICT (user_id, item_id) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING *`;
    return rows[0];
  },
  async removeById(id) {
    const rows = await sql`DELETE FROM wishlists WHERE id = ${id} RETURNING id`;
    if (!rows.length) throw notFound("Wishlist");
    return { message: "Dihapus dari wishlist" };
  },
  async removeByUserItem(user_id, item_id) {
    const rows = await sql`DELETE FROM wishlists WHERE user_id = ${user_id} AND item_id = ${item_id} RETURNING id`;
    if (!rows.length) throw notFound("Wishlist");
    return { message: "Dihapus dari wishlist" };
  },
};
