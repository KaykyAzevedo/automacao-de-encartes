import { Router } from "express";

import { companyRoutes } from "./company.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/companies", companyRoutes);
