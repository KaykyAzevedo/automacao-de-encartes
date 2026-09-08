import { Router } from "express";

import { companyRoutes } from "./company.routes";
import { productRoutes } from "./product.routes";
import { storeRoutes } from "./store.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/companies", companyRoutes);
routes.use("/api/stores", storeRoutes);
routes.use("/api/products", productRoutes);
