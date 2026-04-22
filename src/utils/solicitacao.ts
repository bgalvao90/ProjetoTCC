import { SolicitacaoDto } from "../types";

type PessoaSolicitacao = "Aluno" | "Professor";

export function getPessoaNomeSolicitacao(solicitacao: SolicitacaoDto, pessoa: PessoaSolicitacao) {
  const data = solicitacao as unknown as Record<string, unknown>;
  const candidates = [
    `${pessoa}NomeCompleto`,
    `${pessoa}Nome`,
    `Nome${pessoa}`,
    pessoa,
  ];

  for (const key of candidates) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "object" && value) {
      const nested = value as Record<string, unknown>;
      if (typeof nested.NomeCompleto === "string" && nested.NomeCompleto.trim()) return nested.NomeCompleto;
      if (typeof nested.Nome === "string" && nested.Nome.trim()) return nested.Nome;
    }
  }

  return "";
}

export function getPessoaIdSolicitacao(solicitacao: SolicitacaoDto, pessoa: PessoaSolicitacao) {
  const data = solicitacao as unknown as Record<string, unknown>;
  return Number(data[`${pessoa}UsuarioId`] ?? 0);
}
