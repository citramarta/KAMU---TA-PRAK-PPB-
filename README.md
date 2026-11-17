# KAMU API

REST API untuk **KAMU** - Marketplace Barang Baru & Preloved Khusus Mahasiswa.
Stack: Node.js + Express 5 + Neon (PostgreSQL), pola model → controller → routes (Modul 1).

## Endpoint
| Method | URL | Keterangan |
|---|---|---|
| GET/POST | `/api/categories` | list / tambah kategori |
| GET/PUT/DELETE | `/api/categories/:id` | detail / ubah / hapus |
| POST | `/api/users/login` | body `{ "nim": "..." }` |
| GET/POST | `/api/users` | list / daftar user |
| GET/PUT/DELETE | `/api/users/:id` | profil (+ `active_items`) / ubah / hapus |
| GET | `/api/items` | list; query opsional: `condition` (baru/preloved), `category_id`, `seller_id`, `status`, `search` |
| POST | `/api/items` | tambah barang |
| GET/PUT/DELETE | `/api/items/:id` | detail (+ info penjual & kategori) / ubah (mis. `status: "sold"`) / hapus |
| GET | `/api/wishlists?user_id=` | list barang di wishlist |
| POST | `/api/wishlists` | body `{ "user_id", "item_id" }` |
| DELETE | `/api/wishlists?user_id=&item_id=` | hapus dari wishlist (untuk tombol toggle) |
| DELETE | `/api/wishlists/:id` | hapus berdasarkan id wishlist |

