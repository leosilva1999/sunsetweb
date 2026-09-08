// Só aceita caminhos internos relativos — "//evil.com" e URLs absolutas são
// interpretados pelo browser como redirecionamento pra fora do site.
export function safeRedirectPath(path: string | null, fallback = "/") {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return fallback;
}
