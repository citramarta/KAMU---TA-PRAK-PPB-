// Semua pemanggilan ke API KAMU (Express + Neon) lewat file ini.
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

// Foto hasil upload disimpan sebagai path relatif ("/api/items/:id/image").
// Diubah menjadi URL lengkap ke server API. URL lain (https://..., data:...) dibiarkan.
export const isApiImage = (url) => Boolean(url) && url.startsWith("/");
export const resolveImage = (url) => (isApiImage(url) ? `${BASE}${url}` : url);

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internetmu.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respons bukan JSON */
  }
  if (!res.ok) throw new Error(data?.error || `Terjadi kesalahan (${res.status})`);
  return data;
}

// Menyusun query string, field kosong dilewati
const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  // kategori
  categories: (signal) => request("/api/categories", { signal }),

  // barang
  items: (params, signal) => request(`/api/items${qs(params)}`, { signal }),
  item: (id, signal) => request(`/api/items/${id}`, { signal }),
  createItem: (body) => request("/api/items", { method: "POST", body }),
  updateItem: (id, body) => request(`/api/items/${id}`, { method: "PUT", body }),
  deleteItem: (id, sellerId) => request(`/api/items/${id}${qs({ seller_id: sellerId })}`, { method: "DELETE" }),

  // user
  login: (nim) => request("/api/users/login", { method: "POST", body: { nim } }),
  register: (body) => request("/api/users", { method: "POST", body }),
  updateUser: (id, body) => request(`/api/users/${id}`, { method: "PUT", body }),

  // wishlist / favorit
  wishlist: (userId, signal) => request(`/api/wishlists${qs({ user_id: userId })}`, { signal }),
  addWishlist: (userId, itemId) =>
    request("/api/wishlists", { method: "POST", body: { user_id: userId, item_id: itemId } }),
  removeWishlist: (userId, itemId) =>
    request(`/api/wishlists${qs({ user_id: userId, item_id: itemId })}`, { method: "DELETE" }),
};
