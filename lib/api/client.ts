import { logger } from "@/lib/utils/logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7044/api/v1";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

interface ApiErrorBody {
  title: string;
  errors: Record<string, string[]> | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    // Falhas de model-binding (ex.: GUID malformado na URL) caem no ProblemDetails
    // padrão do ASP.NET Core em vez do formato { title, errors } — sem "title" garantido.
    return {
      title: body.title ?? (response.statusText || "Erro inesperado"),
      errors: body.errors ?? null,
    };
  } catch {
    return { title: response.statusText || "Erro inesperado", errors: null };
  }
}

// 401/404/409/429 são respostas esperadas do fluxo normal (sessão expirada, "ainda
// não avaliou", e-mail duplicado, rate limit) — viram debug pra não poluir o log.
const EXPECTED_CLIENT_ERRORS = new Set([401, 404, 409, 429]);

export async function apiFetch<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {},
): Promise<T> {
  // Sem a query string no log: ela pode carregar termo de busca ou coordenadas.
  const logContext = { method: options.method ?? "GET", path: path.split("?")[0] };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (err) {
    logger.error("Falha de rede ao chamar a API", err, logContext);
    throw err;
  }

  if (!response.ok) {
    const { title, errors } = await parseErrorBody(response);
    const context = { ...logContext, status: response.status, title };
    if (response.status >= 500) {
      logger.error("A API respondeu com erro de servidor", undefined, context);
    } else if (EXPECTED_CLIENT_ERRORS.has(response.status)) {
      logger.debug("A API recusou a requisição", context);
    } else {
      logger.warn("A API recusou a requisição", { ...context, fieldErrors: errors });
    }
    throw new ApiError(response.status, title, errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
