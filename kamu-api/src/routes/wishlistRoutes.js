import express from "express";
import { WishlistController } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", WishlistController.getByUser);
router.post("/", WishlistController.add);
router.delete("/", WishlistController.removeByUserItem);
router.delete("/:id", WishlistController.removeById);

export default router;
