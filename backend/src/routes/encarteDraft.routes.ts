import { Router } from "express";

import { encarteDraftController } from "../controllers/encarteDraft.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const encarteDraftRoutes = Router();

encarteDraftRoutes.use(requireAuth);

encarteDraftRoutes.post("/", encarteDraftController.criar);
encarteDraftRoutes.get("/", encarteDraftController.listar);
encarteDraftRoutes.get("/:id", encarteDraftController.buscar);
encarteDraftRoutes.put("/:id", encarteDraftController.atualizar);
encarteDraftRoutes.delete("/:id", encarteDraftController.remover);
