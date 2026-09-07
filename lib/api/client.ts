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

export async function apiFetch<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const { title, errors } = await parseErrorBody(response);
    throw new ApiError(response.status, title, errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
