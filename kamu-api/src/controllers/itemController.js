  import { ItemModel } from "../models/itemModel.js";
  import { handle, badRequest } from "../utils/handle.js";

  export const ItemController = {
    getAll: handle((req) => ItemModel.getAll(req.query)),
    getById: handle((req) => ItemModel.getById(req.params.id)),
    create: handle((req) => {
      const { title, seller_id } = req.body ?? {};
      if (!title || !seller_id) throw badRequest("title dan seller_id wajib diisi");
      return ItemModel.create(req.body);
    }, 201),
    update: handle((req) => ItemModel.update(req.params.id, req.body ?? {})),
    remove: handle((req) => ItemModel.remove(req.params.id)),
  };
