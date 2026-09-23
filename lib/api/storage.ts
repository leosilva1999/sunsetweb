// PUT direto pro storage (LocalStack em dev) via URL pré-assinada — não passa pelo
// apiFetch porque não é uma chamada pra própria API (sem base URL, sem Bearer token,
// content-type é o da imagem, não application/json). Compartilhado pelo upload de
// fotos e de avatar, que seguem o mesmo padrão de URL pré-assinada.
export async function uploadBlob(uploadUrl: string, blob: Blob): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("Falha ao enviar a imagem para o storage.");
  }
}
