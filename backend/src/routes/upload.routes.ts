import { Router } from "express";

import { uploadController } from "../controllers/upload.controller";
import { limitadorUpload } from "../middlewares/rateLimiter";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadMiddleware } from "../middlewares/upload";

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth);
uploadRoutes.post(
  "/",
  limitadorUpload,
  uploadMiddleware,
  uploadController.enviar
);
