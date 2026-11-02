import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { API_TAGS } from "@/lib/api/tags";
import { logger } from "@/lib/utils/logger";

// Chamada pela Sunset.API quando dados públicos mudam (local/foto/avaliação criado, removido,
// movido...). Em vez de esperar a janela de revalidação das páginas, elas são invalidadas na hora.
// Corpo: { paths: string[], tags: string[] } com o header X-Revalidate-Secret.
// A API tenta de novo uma vez em caso de erro e depois desiste, então responda 2xx ao terminar.

const MAX_PATHS = 100;
const MAX_PATH_LENGTH = 300;

// Compara hashes (tamanho fixo) em tempo constante, sem vazar o tamanho do segredo.
function secretMatches(received: string | null, expected: string): boolean {
  if (!received) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    logger.warn("POST /api/revalidate chamado, mas REVALIDATE_SECRET não está configurado");
    return Response.json({ message: "Revalidation is not configured." }, { status: 503 });
  }

  if (!secretMatches(request.headers.get("X-Revalidate-Secret"), secret)) {
    return Response.json({ message: "Invalid secret." }, { status: 401 });
  }

  let body: { paths?: unknown; tags?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  // Só as tags que o site conhece; qualquer outra é ignorada.
  const tags = toStringArray(body.tags).filter((tag): tag is (typeof API_TAGS)[number] =>
    (API_TAGS as readonly string[]).includes(tag),
  );
  // Só caminhos internos. "//host" ou um valor sem "/" inicial não são rotas do site.
  const paths = toStringArray(body.paths)
    .filter((path) => path.startsWith("/") && !path.startsWith("//") && path.length <= MAX_PATH_LENGTH)
    .slice(0, MAX_PATHS);

  // expire: 0 = a próxima visita já busca dado novo (sem servir a versão velha enquanto isso).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);

  logger.info("Cache do site invalidado pela API", { tags, paths: paths.length });
  return Response.json({ revalidated: true, tags, paths });
}
