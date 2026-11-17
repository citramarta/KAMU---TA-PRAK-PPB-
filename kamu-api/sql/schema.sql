create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nim text not null unique,
  faculty text,
  whatsapp text,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  condition text not null default 'preloved' check (condition in ('baru', 'preloved')),
  condition_note text,                 -- contoh: "Like New", "Pemakaian 1 semester"
  image_url text,
  category_id uuid references categories(id) on delete set null,
  seller_id uuid not null references users(id) on delete cascade,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now()
);

create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists idx_items_category on items(category_id);
create index if not exists idx_items_seller on items(seller_id);
create index if not exists idx_wishlists_user on wishlists(user_id);

-- Data awal kategori
insert into categories (name) values
  ('Buku & Alat Tulis'),
  ('Elektronik & Gadget'),
  ('Fashion & Pakaian'),
  ('Perlengkapan Kos'),
  ('Makanan & Minuman'),
  ('Olahraga & Hobi'),
  ('Merchandise Organisasi'),
  ('Lainnya')
on conflict (name) do nothing;
