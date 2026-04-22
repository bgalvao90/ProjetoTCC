import { UniversidadeDto } from "../types";

export function getUniversidadeId(universidade: UniversidadeDto) {
  return Number(universidade.UniversidadeId ?? universidade.universidadeId ?? universidade.id);
}

export function getUniversidadeNome(universidade: UniversidadeDto) {
  const nome = universidade.Nome ?? universidade.nome ?? universidade.Descricao ?? universidade.descricao;
  const sigla = universidade.Sigla ?? universidade.sigla;

  if (typeof nome === "string" && typeof sigla === "string" && sigla.trim()) return `${nome} (${sigla})`;
  if (typeof nome === "string" && nome.trim()) return nome;
  if (typeof sigla === "string" && sigla.trim()) return sigla;

  return `Universidade ${getUniversidadeId(universidade)}`;
}

export function getUniversidadeNomeById(universidades: UniversidadeDto[], universidadeId: number) {
  const universidade = universidades.find((item) => getUniversidadeId(item) === universidadeId);
  return universidade ? getUniversidadeNome(universidade) : `Universidade ${universidadeId}`;
}
