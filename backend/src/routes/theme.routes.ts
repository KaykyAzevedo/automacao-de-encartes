import { Router } from "express";

import { themeController } from "../controllers/theme.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const themeRoutes = Router();

themeRoutes.use(requireAuth);

themeRoutes.post("/", themeController.criar);
themeRoutes.get("/:id", themeController.buscar);
themeRoutes.put("/:id", themeController.atualizar);
themeRoutes.delete("/:id", themeController.remover);
