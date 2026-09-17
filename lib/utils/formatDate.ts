export function formatDate(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// timeZone explícito é obrigatório aqui — sem ele, o horário sai convertido pro
// fuso de quem está rodando o código (servidor Next.js ou browser do visitante),
// não o fuso do próprio local, que é o que faz sentido mostrar num pôr do sol.
export function formatTime(iso: string, timeZone: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(iso));
}
