import { Router } from "express";

import { productController } from "../controllers/product.controller";
import { limitadorUpload } from "../middlewares/rateLimiter";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadMiddleware } from "../middlewares/upload";

export const productRoutes = Router();

productRoutes.use(requireAuth);

productRoutes.post("/", productController.criar);
productRoutes.get("/", productController.listar);

// precisam vir antes de qualquer rota com /:id, senao seriam
// capturadas como um id
productRoutes.get("/search", productController.buscar);
productRoutes.post("/match", productController.match);
productRoutes.post(
  "/upload-photo",
  limitadorUpload,
  uploadMiddleware,
  productController.uploadFoto
);

productRoutes.put("/:id", productController.atualizar);
productRoutes.delete("/:id", productController.remover);
