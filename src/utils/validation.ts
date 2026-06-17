export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const allowedUploadMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const allowedUploadExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp", "txt"]);

export function validatePassword(value: string) {
  if (value.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[a-z]/.test(value)) return "A senha deve conter uma letra minuscula.";
  if (!/[A-Z]/.test(value)) return "A senha deve conter uma letra maiuscula.";
  if (!/\d/.test(value)) return "A senha deve conter um numero.";
  if (!/[^A-Za-z0-9]/.test(value)) return "A senha deve conter um caractere especial.";
  return null;
}

export function sanitizeFileName(name: string) {
  const sanitized = name
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/[\r\n\t]/g, "")
    .trim();
  return sanitized || "arquivo";
}

export function validateSelectedFile(file: {
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
}) {
  const size = file.size ?? 0;
  if (size <= 0) return "Arquivo vazio ou invalido.";
  if (size > 25 * 1024 * 1024) return "O arquivo deve ter no maximo 25 MB.";

  const name = sanitizeFileName(file.name ?? "");
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : "";
  if (!extension || !allowedUploadExtensions.has(extension)) {
    return "Tipo de arquivo nao permitido.";
  }

  const mimeType = file.mimeType?.toLowerCase();
  if (mimeType && !allowedUploadMimeTypes.has(mimeType)) {
    return "Tipo de arquivo nao permitido.";
  }

  return null;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (
      error as { response?: { data?: unknown; status?: number } }
    ).response;
    const data = response?.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data && "message" in data) {
      return String((data as { message: unknown }).message);
    }
    if (typeof data === "object" && data && "Message" in data) {
      return String((data as { Message: unknown }).Message);
    }
    if (typeof data === "object" && data && "errors" in data) {
      return "Verifique os campos informados.";
    }
    if (response?.status === 403) {
      return "Voce nao tem permissao para concluir esta operacao.";
    }
    if (response?.status === 404) {
      return "O recurso solicitado nao foi encontrado.";
    }
    if (response?.status === 409) {
      return "Os dados foram alterados por outro usuario. Recarregue e tente novamente.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Nao foi possivel concluir a operacao.";
}
