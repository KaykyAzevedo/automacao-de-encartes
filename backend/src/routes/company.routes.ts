import { Router } from "express";

import { companyController } from "../controllers/company.controller";
import { requireAuth } from "../middlewares/requireAuth";

export const companyRoutes = Router();

// autenticacao exigida em todas as rotas abaixo
companyRoutes.use(requireAuth);

companyRoutes.post("/", companyController.criar);
companyRoutes.get("/", companyController.listar);
companyRoutes.get("/:id", companyController.buscar);
companyRoutes.put("/:id", companyController.atualizar);
companyRoutes.delete("/:id", companyController.remover);
