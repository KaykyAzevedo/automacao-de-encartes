import { Router } from "express";

import { themeController } from "../controllers/theme.controller";
import { themeTemplateController } from "../controllers/themeTemplate.controller";
import { limitadorUpload } from "../middlewares/rateLimiter";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadTemplatesMiddleware } from "../middlewares/upload";

export const themeRoutes = Router();

themeRoutes.use(requireAuth);

// precisa vir antes de "/:id" (GET), senao "import-png" seria lido
// como um id
themeRoutes.post(
  "/import-png",
  limitadorUpload,
  uploadTemplatesMiddleware,
  themeTemplateController.importar
);

themeRoutes.post("/", themeController.criar);
themeRoutes.get("/:id", themeController.buscar);
themeRoutes.put("/:id", themeController.atualizar);
themeRoutes.delete("/:id", themeController.remover);
