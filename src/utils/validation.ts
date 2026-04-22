export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
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
  }
  if (error instanceof Error) return error.message;
  return "Nao foi possivel concluir a operacao.";
}
