import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { routes } from "./routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);
