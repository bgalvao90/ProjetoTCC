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

export enum TarefaStatus {
  Pendente = 1,
  EmProgresso = 2,
  Concluida = 3,
}

export type TarefaDto = {
  TarefaId: number;
  SolicitacaoId: number;
  Titulo: string;
  Descricao?: string | null;
  StatusId: TarefaStatus;
  ResponsavelUsuarioId?: number | null;
  PossuiMidia: boolean;
  MidiaId?: string | null;
  DataCriacao: string;
  DataAlteracao?: string | null;
  DataConclusao?: string | null;
};

export type CriarTarefaRequest = {
  SolicitacaoId: number;
  Titulo: string;
  Descricao?: string | null;
  ResponsavelUsuarioId?: number | null;
  MidiaId?: string | null;
};

export type AtualizarTarefaRequest = CriarTarefaRequest;

export type AlterarStatusTarefaRequest = {
  NovoStatusId: TarefaStatus;
};

export type TarefaRealtimePayload = Pick<
  TarefaDto,
  "TarefaId" | "SolicitacaoId" | "Titulo" | "StatusId" | "ResponsavelUsuarioId"
>;

export type ParticipanteTarefa = {
  UsuarioId: number;
  Nome: string;
};

export enum OrientacaoStatus {
  Pendente = 1,
  EmAndamento = 2,
  Recusada = 3,
  Finalizada = 4,
  Pausada = 5,
}

export type ParticipanteOrientacaoDto = {
  UsuarioId: number;
  Nome: string;
  Papel: "Aluno" | "Professor" | string;
  Ativo: boolean;
  AdicionadoEm: string;
};

export type OrientacaoDto = SolicitacaoDto & {
  Participantes?: ParticipanteOrientacaoDto[] | null;
  Versao: number;
};

export type TimelineTipo =
  | "Mensagem"
  | "Anexo"
  | "Tarefa"
  | "LinkEstudo"
  | "EventoSistema";

export type TimelineItemDto = {
  TimelineItemId: number;
  SolicitacaoId: number;
  Tipo: TimelineTipo;
  AutorUsuarioId?: number | null;
  ConteudoMarkdown?: string | null;
  ReferenciaEntidadeId?: string | null;
  CriadoEm: string;
  EditadoEm?: string | null;
  RemovidoEm?: string | null;
  Versao: number;
};

export type TimelinePageDto = {
  Itens: TimelineItemDto[];
  ProximoCursor?: number | null;
};

export type AlterarStatusOrientacaoRequest = {
  NovoStatusId: OrientacaoStatus;
  Versao: number;
};

export type AdicionarAlunoOrientacaoRequest = {
  UsuarioId: number;
  Versao: number;
};

export type PassoTarefaDto = {
  PassoTarefaId: number;
  TarefaId: number;
  Descricao: string;
  Ordem: number;
  Concluido: boolean;
  CriadoPorUsuarioId: number;
  CriadoEm: string;
  ConcluidoPorUsuarioId?: number | null;
  ConcluidoEm?: string | null;
};

export type TarefaOrientacaoDto = TarefaDto & {
  OwnerUsuarioId: number;
  Prazo?: string | null;
  Passos?: PassoTarefaDto[] | null;
  Versao: number;
  RemovidoEm?: string | null;
};

export type CriarPassoTarefaRequest = {
  Descricao: string;
  Ordem: number;
};

export type AlterarConclusaoPassoRequest = {
  Concluido: boolean;
  Versao: number;
};

export type RegistrarDispositivoPushRequest = {
  ExpoPushToken: string;
  Plataforma: string;
};

export type ArquivoSelecionado = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};
