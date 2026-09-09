import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FormCompany } from "@/components/preparation/FormCompany";
import { ToastProvider } from "@/components/ui/Toast";

function renderComProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
}

describe("<FormCompany />", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renderiza os campos do formulário", () => {
    renderComProviders(<FormCompany onFechar={vi.fn()} />);

    expect(
      screen.getByPlaceholderText("Empório Hortifruti")
    ).toBeInTheDocument();
    expect(screen.getByText("Estilo dos encartes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar empresa" })
    ).toBeInTheDocument();
  });

  it("mostra erro de validação e não chama a API quando o nome está vazio", async () => {
    const usuario = userEvent.setup();
    renderComProviders(<FormCompany onFechar={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Criar empresa" }));

    expect(
      await screen.findByText("Informe o nome da empresa")
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submete os dados corretos e chama a API ao preencher o nome", async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: "empresa-1",
        name: "Empório Hortifruti",
        style: "sofisticado",
        logo: null,
      }),
    });

    const onFechar = vi.fn();
    const usuario = userEvent.setup();
    renderComProviders(<FormCompany onFechar={onFechar} />);

    await usuario.type(
      screen.getByPlaceholderText("Empório Hortifruti"),
      "Empório Hortifruti"
    );
    await usuario.click(screen.getByRole("button", { name: "Criar empresa" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/companies");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      name: "Empório Hortifruti",
      style: "sofisticado",
      logo: null,
    });

    await waitFor(() => expect(onFechar).toHaveBeenCalled());
  });
});
