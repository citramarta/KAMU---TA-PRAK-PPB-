import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();

const app = express();

// CORS: wajib karena PWA (domain Vercel A) memanggil API (domain Vercel B)
const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : "*";
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "KAMU API", status: "ok" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/wishlists", wishlistRoutes);

app.use((req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
