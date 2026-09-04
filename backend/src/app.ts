import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { routes } from "./routes";

export const app = express();

// credentials: true para o cookie de sessao do NextAuth chegar ao backend
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);
