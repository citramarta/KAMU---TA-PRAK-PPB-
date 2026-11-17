import { WishlistModel } from "../models/wishlistModel.js";
import { handle, badRequest } from "../utils/handle.js";

export const WishlistController = {
  getByUser: handle((req) => {
    if (!req.query.user_id) throw badRequest("query user_id wajib diisi");
    return WishlistModel.getByUser(req.query.user_id);
  }),
  add: handle((req) => {
    const { user_id, item_id } = req.body ?? {};
    if (!user_id || !item_id) throw badRequest("user_id dan item_id wajib diisi");
    return WishlistModel.add(user_id, item_id);
  }, 201),
  // DELETE /api/wishlists?user_id=..&item_id=..  (praktis untuk tombol toggle di UI)
  removeByUserItem: handle((req) => {
    const { user_id, item_id } = req.query;
    if (!user_id || !item_id) throw badRequest("user_id dan item_id wajib diisi");
    return WishlistModel.removeByUserItem(user_id, item_id);
  }),
  removeById: handle((req) => WishlistModel.removeById(req.params.id)),
};
