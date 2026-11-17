# KAMU API

REST API untuk **KAMU** - Marketplace Barang Baru & Preloved Khusus Mahasiswa.
Stack: Node.js + Express 5 + Neon (PostgreSQL), pola model → controller → routes (Modul 1).

## Setup
1. Buat project di https://neon.tech, buka **SQL Editor**, jalankan isi `sql/schema.sql`.
2. Salin `.env.example` menjadi `.env`, isi `DATABASE_URL` (dari tombol **Connect** di Neon).
3. `npm install`
4. `npm run dev`  → http://localhost:3000

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

## Contoh body (Postman)
POST `/api/users`
```json
{ "name": "Budi Santoso", "nim": "21120123140001", "faculty": "Teknik", "whatsapp": "6281234567890", "email": "budi@students.undip.ac.id" }
```
POST `/api/items`
```json
{
  "title": "Kalkulus Edisi 9 - James Stewart",
  "description": "Buku bekas, bersih, tanpa coretan",
  "price": 85000,
  "condition": "preloved",
  "condition_note": "Like New",
  "image_url": "https://contoh.com/foto.jpg",
  "category_id": "ID_KATEGORI",
  "seller_id": "ID_USER"
}
```

## Deploy ke Vercel
Push ke GitHub → Import di Vercel → tambahkan Environment Variable `DATABASE_URL` (dan opsional `CORS_ORIGIN`) → Deploy.
