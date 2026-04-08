import { Response } from "express";

const GENERIC_MESSAGES: Record<number, string> = {
  400: "Nao foi possivel processar a solicitacao.",
  401: "Nao autorizado.",
  403: "Acesso negado.",
  500: "Erro interno do servidor.",
};

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: error,
  };
}

export function sendErrorResponse(
  res: Response,
  status: number,
  context: string,
  error?: unknown,
) {
  if (error !== undefined) {
    console.error(`[${context}]`, getErrorDetails(error));
  }

  return res.status(status).json({
    message: GENERIC_MESSAGES[status] ?? GENERIC_MESSAGES[500],
  });
}
