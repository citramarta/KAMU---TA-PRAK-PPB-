import { ItemModel } from "../models/itemModel.js";
import { handle } from "../utils/handle.js";

export const ItemController = {
  getAll: handle((req) => ItemModel.getAll(req.query)),
  getById: handle((req) => ItemModel.getById(req.params.id)),

  // Mengirim foto sebagai gambar (bukan JSON), di-cache lama karena tidak pernah berubah
  image: async (req, res) => {
    try {
      const img = await ItemModel.getImage(req.params.id);
      res.set({
        "Content-Type": img.content_type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cross-Origin-Resource-Policy": "cross-origin",
      });
      res.send(Buffer.from(img.data, "base64"));
    } catch (err) {
      const status = err.code === "22P02" ? 404 : err.status || 500;
      res.status(status).json({ error: status === 404 ? "Foto tidak ditemukan" : err.message });
    }
  },

  // Validasi isi barang dilakukan di ItemModel (butuh pengecekan kategori di database)
  create: handle((req) => ItemModel.create(req.body ?? {}), 201),
  update: handle((req) => ItemModel.update(req.params.id, req.body ?? {})),
  remove: handle((req) => ItemModel.remove(req.params.id, req.query.seller_id)),
};
