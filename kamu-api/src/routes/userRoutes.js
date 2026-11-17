import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.post("/login", UserController.login); // harus di atas "/:id"
router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.remove);

export default router;
