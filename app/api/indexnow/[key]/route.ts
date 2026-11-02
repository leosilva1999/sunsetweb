// Arquivo de prova do IndexNow: https://sunsetsss.com/{chave}.txt devolve a própria chave.
// A rewrite em next.config.ts leva "/{chave}.txt" pra cá; a chave vem de INDEXNOW_KEY e é a
// mesma que a API usa em IndexNow__Key. Sem chave configurada, ou com outra, é 404.
export async function GET(_request: Request, ctx: RouteContext<"/api/indexnow/[key]">) {
  const { key } = await ctx.params;
  const expected = process.env.INDEXNOW_KEY;

  if (!expected || key !== expected) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(expected, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
