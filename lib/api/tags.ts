// Grupos de dados da API que o site guarda em cache. POST /api/revalidate (chamado pela API
// quando algo muda) invalida por estas tags; todo fetch de leitura pública declara a sua.
export const API_TAGS = ["locations", "photos", "cities"] as const;
export type ApiTag = (typeof API_TAGS)[number];

// Opção `next` do fetch. No navegador o campo é ignorado.
export function tagged(tag: ApiTag) {
  return { next: { tags: [tag] } };
}
