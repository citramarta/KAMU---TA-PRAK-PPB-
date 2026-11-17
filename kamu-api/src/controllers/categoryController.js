import { CategoryModel } from "../models/categoryModel.js";
import { handle, badRequest } from "../utils/handle.js";

export const CategoryController = {
  getAll: handle(() => CategoryModel.getAll()),
  getById: handle((req) => CategoryModel.getById(req.params.id)),
  create: handle((req) => {
    if (!req.body?.name) throw badRequest("name wajib diisi");
    return CategoryModel.create(req.body.name);
  }, 201),
  update: handle((req) => {
    if (!req.body?.name) throw badRequest("name wajib diisi");
    return CategoryModel.update(req.params.id, req.body.name);
  }),
  remove: handle((req) => CategoryModel.remove(req.params.id)),
};
