export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

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
