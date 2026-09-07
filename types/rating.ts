// A API não tem um recurso "rating" próprio: avaliar é POST /locations/{id}/ratings
// (upsert), que devolve a Location com avgRating recalculado — não há endpoint pra
// consultar a nota que o usuário atual já deu. Esse tipo existe só pro payload de request.
export type RatingScore = 1 | 2 | 3 | 4 | 5;
