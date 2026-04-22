export type TipoUsuario = "Aluno" | "Professor" | string;

export type UsuarioDto = {
  UsuarioId: number;
  PessoaId: number;
  NomeCompleto: string;
  Email: string;
  Telefone: string;
  UniversidadeId: number;
  FotoPerfilMidiaId?: string | null;
  TipoUsuario: TipoUsuario;
  Ativo: boolean;
};

export type UniversidadeDto = {
  UniversidadeId: number;
  Nome?: string;
  Sigla?: string | null;
  [key: string]: unknown;
};

export type LoginRequest = {
  Email: string;
  Senha: string;
};

export type CadastroRequest = {
  NomeCompleto: string;
  Email: string;
  Telefone: string;
  UniversidadeId: number;
  Senha: string;
  FotoPerfilMidiaId?: string | null;
};

export type AuthResponse = {
  Token: string;
  Usuario: UsuarioDto;
};

export type AtualizarUsuarioRequest = {
  NomeCompleto: string;
  Telefone: string;
  UniversidadeId: number;
  FotoPerfilMidiaId?: string | null;
  Ativo: boolean;
};

export type SolicitacaoDto = {
  SolicitacaoId: number;
  AlunoUsuarioId: number;
  ProfessorUsuarioId: number;
  AlunoNome?: string | null;
  AlunoNomeCompleto?: string | null;
  ProfessorNome?: string | null;
  ProfessorNomeCompleto?: string | null;
  TituloTcc: string;
  DescricaoTema: string;
  StatusId: number;
  Status: string;
  DataCriacao: string;
};

export type CriarSolicitacaoRequest = {
  ProfessorUsuarioId: number;
  TituloTcc: string;
  DescricaoTema: string;
};

export type RecusarSolicitacaoRequest = {
  MensagemFinal?: string | null;
};

export type MensagemDto = {
  MensagemId: number;
  SolicitacaoId: number;
  RemetenteUsuarioId: number;
  Conteudo: string;
  DataEnvio: string;
  PossuiMidia: boolean;
  MidiaId?: string | null;
};

export type CriarMensagemRequest = {
  SolicitacaoId: number;
  Conteudo: string;
  MidiaId?: string | null;
};

export type UploadMidiaRequest = {
  EntidadeOrigem: string;
  EntidadeId: number;
  NomeArquivo: string;
  ContentType: string;
  Base64?: string | null;
  Url?: string | null;
};

export type MidiaDto = UploadMidiaRequest & {
  MidiaId: string;
  DataCriacao: string;
};
