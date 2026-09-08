import { Router } from "express";

import { productController } from "../controllers/product.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const productRoutes = Router();

productRoutes.use(requireAuth);

productRoutes.post("/", productController.criar);
productRoutes.get("/", productController.listar);

// precisam vir antes de qualquer rota com /:id, senao seriam
// capturadas como um id
productRoutes.get("/search", productController.buscar);
productRoutes.post("/match", productController.match);

productRoutes.put("/:id", productController.atualizar);
productRoutes.delete("/:id", productController.remover);
