import { Router } from "express";

import { companyController } from "../controllers/company.controller";
import { storeController } from "../controllers/store.controller";
import { themeController } from "../controllers/theme.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const companyRoutes = Router();

// autenticacao exigida em todas as rotas abaixo
companyRoutes.use(requireAuth);

companyRoutes.post("/", companyController.criar);
companyRoutes.get("/", companyController.listar);
companyRoutes.get("/:id", companyController.buscar);
companyRoutes.put("/:id", companyController.atualizar);
companyRoutes.delete("/:id", companyController.remover);

// lojas e temas de uma empresa
companyRoutes.get("/:companyId/stores", storeController.listarPorEmpresa);
companyRoutes.get("/:companyId/themes", themeController.listarPorEmpresa);
