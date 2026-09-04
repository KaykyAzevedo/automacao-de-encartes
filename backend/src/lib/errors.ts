export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const naoAutenticado = () => new AppError(401, "Não autenticado");

export const naoEncontrado = (mensagem: string) => new AppError(404, mensagem);
