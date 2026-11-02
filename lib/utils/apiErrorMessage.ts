import { ApiError } from "@/lib/api/client";

// Mensagem pronta pra exibir num erro inesperado de chamada à API. Erros de servidor (5xx)
// levam o código da requisição, que é a chave pra achar o que aconteceu nos logs da API;
// 429 vira um pedido de calma em vez do título em inglês do servidor.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  if (err.status === 429) return "Muitas tentativas em pouco tempo. Aguarde alguns segundos e tente de novo.";
  if (err.status >= 500) return err.requestId ? `${fallback} (código: ${err.requestId})` : fallback;
  return err.message;
}
