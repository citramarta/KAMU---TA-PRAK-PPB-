import { UserModel } from "../models/userModel.js";
import { handle, badRequest } from "../utils/handle.js";

export const UserController = {
  getAll: handle(() => UserModel.getAll()),
  getById: handle((req) => UserModel.getById(req.params.id)),
  // Login sederhana lewat NIM (tanpa password) - cukup untuk kebutuhan tugas
  login: handle((req) => {
    if (!req.body?.nim) throw badRequest("nim wajib diisi");
    return UserModel.getByNim(req.body.nim);
  }),
  create: handle((req) => {
    const { name, nim } = req.body ?? {};
    if (!name || !nim) throw badRequest("name dan nim wajib diisi");
    return UserModel.create(req.body);
  }, 201),
  update: handle((req) => UserModel.update(req.params.id, req.body ?? {})),
  remove: handle((req) => UserModel.remove(req.params.id)),
};
