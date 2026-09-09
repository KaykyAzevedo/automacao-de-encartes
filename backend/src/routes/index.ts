import { Router } from "express";

import { companyRoutes } from "./company.routes";
import { encarteDraftRoutes } from "./encarteDraft.routes";
import { productRoutes } from "./product.routes";
import { storeRoutes } from "./store.routes";
import { themeRoutes } from "./theme.routes";
import { uploadRoutes } from "./upload.routes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/companies", companyRoutes);
routes.use("/api/stores", storeRoutes);
routes.use("/api/products", productRoutes);
routes.use("/api/themes", themeRoutes);
routes.use("/api/upload", uploadRoutes);
routes.use("/api/encartes", encarteDraftRoutes);
