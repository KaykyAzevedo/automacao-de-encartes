import { Router } from "express";

import { storeController } from "../controllers/store.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const storeRoutes = Router();

storeRoutes.use(requireAuth);

storeRoutes.post("/", storeController.criar);
storeRoutes.get("/:id", storeController.buscar);
storeRoutes.put("/:id", storeController.atualizar);
storeRoutes.delete("/:id", storeController.remover);
