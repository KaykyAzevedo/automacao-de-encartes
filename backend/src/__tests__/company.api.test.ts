import express from "express";
import request from "supertest";

import { errorHandler, notFoundHandler } from "../middlewares/errorHandler";

// Substitui a autenticacao real (que dependeria de banco/cookie) por
// um usuario fixo, controlavel por teste.
let usuarioAtual: { id: string; email: string; name: string | null } | null = {
  id: "user-1",
  email: "dono@teste.com",
  name: "Dono",
};

jest.mock("../middlewares/requireAuth", () => ({
  requireAuth: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!usuarioAtual) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    req.usuario = usuarioAtual;
    next();
  },
}));

// Banco em memoria minimo, so com o suficiente pra exercitar
// create/find/delete do model Company usado pelo companyService.
interface EmpresaFake {
  id: string;
  userId: string;
  name: string;
  style: string;
  logo: string | null;
}

const bancoEmpresas = new Map<string, EmpresaFake>();
let proximoId = 1;

jest.mock("../lib/prisma", () => ({
  prisma: {
    company: {
      create: jest.fn(async ({ data }: { data: Omit<EmpresaFake, "id"> }) => {
        const empresa = { id: `empresa-${proximoId++}`, ...data };
        bancoEmpresas.set(empresa.id, empresa);
        return empresa;
      }),
      findFirst: jest.fn(
        async ({ where }: { where: { id: string; userId: string } }) => {
          const empresa = bancoEmpresas.get(where.id);
          if (!empresa || empresa.userId !== where.userId) return null;
          return empresa;
        }
      ),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        bancoEmpresas.delete(where.id);
      }),
    },
  },
}));

import { companyRoutes } from "../routes/company.routes";

function criarApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/companies", companyRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("API /api/companies", () => {
  beforeEach(() => {
    bancoEmpresas.clear();
    proximoId = 1;
    usuarioAtual = { id: "user-1", email: "dono@teste.com", name: "Dono" };
  });

  describe("POST /api/companies", () => {
    it("cria uma empresa com sucesso e devolve 201", async () => {
      const app = criarApp();

      const resposta = await request(app)
        .post("/api/companies")
        .send({ name: "Empório Hortifruti" });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toMatchObject({
        name: "Empório Hortifruti",
        style: "sofisticado",
        userId: "user-1",
      });
    });

    it("retorna 400 quando o name está ausente", async () => {
      const app = criarApp();

      const resposta = await request(app).post("/api/companies").send({});

      expect(resposta.status).toBe(400);
      expect(resposta.body.error).toBe("Dados inválidos");
    });

    it("retorna 401 quando não há usuário autenticado", async () => {
      usuarioAtual = null;
      const app = criarApp();

      const resposta = await request(app)
        .post("/api/companies")
        .send({ name: "Empório Hortifruti" });

      expect(resposta.status).toBe(401);
    });
  });

  describe("DELETE /api/companies/:id", () => {
    it("dono consegue deletar a própria empresa", async () => {
      const app = criarApp();
      const criada = await request(app)
        .post("/api/companies")
        .send({ name: "Empresa do Dono" });

      const resposta = await request(app).delete(
        `/api/companies/${criada.body.id}`
      );

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual({ success: true });
    });

    it("outro usuário não consegue deletar (permission check) e recebe 404", async () => {
      const app = criarApp();
      const criada = await request(app)
        .post("/api/companies")
        .send({ name: "Empresa do Dono" });

      // troca o usuario autenticado para alguem que nao e o dono
      usuarioAtual = { id: "user-2", email: "invasor@teste.com", name: null };

      const resposta = await request(app).delete(
        `/api/companies/${criada.body.id}`
      );

      expect(resposta.status).toBe(404);
      // a empresa continua existindo - o delete nao foi executado
      expect(bancoEmpresas.has(criada.body.id)).toBe(true);
    });
  });
});
