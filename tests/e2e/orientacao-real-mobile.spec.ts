import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const apiUrl = process.env.E2E_API_URL ?? "http://192.168.100.2:8080";
const senha = "Senha123!";

type Usuario = {
  UsuarioId: number;
  NomeCompleto: string;
  Email: string;
  TipoUsuario: string;
};

type Auth = {
  Token: string;
  Usuario: Usuario;
};

type Solicitacao = {
  SolicitacaoId: number;
  Status: string;
  StatusId: number;
  Versao: number;
};

type Tarefa = {
  TarefaId: number;
  StatusId: number;
};

type Fixture = {
  stamp: string;
  aluno: Usuario;
  professor: Usuario;
  alunoEmail: string;
  professorEmail: string;
  alunoNome: string;
  professorNome: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function clickTouchable(page: Page, text: string, exact = true) {
  const pattern = exact ? new RegExp(`^${escapeRegex(text)}$`) : new RegExp(escapeRegex(text));
  await page.locator("div[tabindex='0']").filter({ hasText: pattern }).last().click({ timeout: 10_000 });
}

async function pauseDemo(page: Page, ms = 900) {
  await page.waitForTimeout(ms);
}

async function apiPost<T>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token?: string,
): Promise<T> {
  const response = await request.post(`${apiUrl}${path}`, {
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `${path}: ${await response.text()}`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function apiPut<T>(
  request: APIRequestContext,
  path: string,
  data?: unknown,
  token?: string,
): Promise<T> {
  const response = await request.put(`${apiUrl}${path}`, {
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `${path}: ${await response.text()}`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function apiGet<T>(
  request: APIRequestContext,
  path: string,
  token?: string,
): Promise<T> {
  const response = await request.get(`${apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `${path}: ${await response.text()}`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function loginApi(request: APIRequestContext, email: string): Promise<Auth> {
  return apiPost<Auth>(request, "/auth/login", { Email: email, Senha: senha });
}

async function createUsers(request: APIRequestContext): Promise<Fixture> {
  const stamp = `${Date.now()}-${test.info().parallelIndex}`;
  const alunoEmail = `aluno.e2e.${stamp}@teste.local`;
  const professorEmail = `prof.e2e.${stamp}@teste.local`;
  const alunoNome = `Aluno E2E ${stamp}`;
  const professorNome = `Professor E2E ${stamp}`;
  const base = {
    Telefone: "34999990000",
    UniversidadeId: 1,
    Senha: senha,
    FotoPerfilMidiaId: null,
  };

  const aluno = await apiPost<Usuario>(request, "/auth/registrar-aluno", {
    ...base,
    NomeCompleto: alunoNome,
    Email: alunoEmail,
    Telefone: "34999990001",
  });
  const professor = await apiPost<Usuario>(request, "/auth/registrar-professor", {
    ...base,
    NomeCompleto: professorNome,
    Email: professorEmail,
    Telefone: "34999990002",
  });

  return { stamp, aluno, professor, alunoEmail, professorEmail, alunoNome, professorNome };
}

async function createSolicitacao(
  request: APIRequestContext,
  fixture: Fixture,
  title = `TCC Mobile ${fixture.stamp}`,
): Promise<Solicitacao> {
  const auth = await loginApi(request, fixture.alunoEmail);
  return apiPost<Solicitacao>(
    request,
    "/solicitacoes",
    {
      ProfessorUsuarioId: fixture.professor.UsuarioId,
      TituloTcc: title,
      DescricaoTema: "Fluxo real validado em viewport mobile.",
    },
    auth.Token,
  );
}

async function acceptSolicitacao(
  request: APIRequestContext,
  fixture: Fixture,
  solicitacao: Solicitacao,
): Promise<Solicitacao> {
  const auth = await loginApi(request, fixture.professorEmail);
  return apiPut<Solicitacao>(
    request,
    `/solicitacoes/${solicitacao.SolicitacaoId}/aceitar`,
    undefined,
    auth.Token,
  );
}

async function loginUi(page: Page, email: string) {
  await page.goto("/");
  await page.locator("input").nth(0).fill(email);
  await page.locator("input").nth(1).fill(senha);
  await clickTouchable(page, "Entrar");
  await expect(page.getByText("Bem Vindo!", { exact: true })).toBeVisible({ timeout: 15_000 });
}

async function openSolicitacao(page: Page, email: string, title: string) {
  await loginUi(page, email);
  await clickTouchable(page, email.startsWith("prof.") ? "Solicitações recebidas" : "Minhas solicitações");
  await clickTouchable(page, title, false);
  await expect(page.getByText(title, { exact: true }).last()).toBeVisible();
}

async function createSolicitacaoUi(page: Page, fixture: Fixture, title: string) {
  await loginUi(page, fixture.alunoEmail);
  await clickTouchable(page, "Minhas solicitações");
  await clickTouchable(page, "Nova solicitação");
  await clickTouchable(page, "Selecione um professor", false);
  await clickTouchable(page, fixture.professorNome, false);
  await page.locator("input").nth(0).fill(title);
  await page.locator("textarea").fill("Tema criado pela interface mobile do Expo Web.");
  await clickTouchable(page, "Enviar solicitação");
  await expect(page.getByText(title, { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Pendente", { exact: true })).toBeVisible();
}

test.describe("API real - contratos funcionais", () => {
  test("cadastro, login, solicitacao, mensagem e tarefa", async ({ request }) => {
    await apiGet(request, "/universidades");
    const fixture = await createUsers(request);
    const solicitacao = await createSolicitacao(request, fixture);
    const accepted = await acceptSolicitacao(request, fixture, solicitacao);
    expect(accepted.StatusId).toBe(2);

    const professorAuth = await loginApi(request, fixture.professorEmail);
    const mensagem = await apiPost<{ MensagemId: number }>(
      request,
      "/mensagens",
      {
        SolicitacaoId: solicitacao.SolicitacaoId,
        Conteudo: "Mensagem enviada por contrato Playwright.",
        MidiaId: null,
      },
      professorAuth.Token,
    );
    expect(mensagem.MensagemId).toBeGreaterThan(0);

    const tarefa = await apiPost<Tarefa>(
      request,
      `/solicitacoes/${solicitacao.SolicitacaoId}/tarefas`,
      {
        SolicitacaoId: solicitacao.SolicitacaoId,
        Titulo: "Tarefa por contrato Playwright",
        Descricao: "Criar, iniciar e concluir via API real.",
        ResponsavelUsuarioId: fixture.aluno.UsuarioId,
        MidiaId: null,
      },
      professorAuth.Token,
    );
    expect(tarefa.TarefaId).toBeGreaterThan(0);
    expect((await apiPut<Tarefa>(request, `/solicitacoes/${solicitacao.SolicitacaoId}/tarefas/${tarefa.TarefaId}/status`, 2, professorAuth.Token)).StatusId).toBe(2);
    expect((await apiPut<Tarefa>(request, `/solicitacoes/${solicitacao.SolicitacaoId}/tarefas/${tarefa.TarefaId}/status`, 3, professorAuth.Token)).StatusId).toBe(3);
  });
});

test.describe("App mobile - fluxos principais", () => {
  test("aluno cria solicitacao pela UI", async ({ page, request }) => {
    const fixture = await createUsers(request);
    await createSolicitacaoUi(page, fixture, `TCC UI ${fixture.stamp}`);
  });

  test("professor aceita solicitacao pela UI", async ({ page, request }) => {
    const fixture = await createUsers(request);
    const title = `TCC Aceite ${fixture.stamp}`;
    await createSolicitacao(request, fixture, title);
    await openSolicitacao(page, fixture.professorEmail, title);
    await clickTouchable(page, "...");
    await clickTouchable(page, "Aceitar");
    await clickTouchable(page, "Confirmar alteracao");
    await expect(page.getByText("Aceita", { exact: true })).toBeVisible();
  });

  test("professor envia mensagem em orientacao aceita", async ({ page, request }) => {
    const fixture = await createUsers(request);
    const title = `TCC Mensagem ${fixture.stamp}`;
    const solicitacao = await createSolicitacao(request, fixture, title);
    await acceptSolicitacao(request, fixture, solicitacao);

    await openSolicitacao(page, fixture.professorEmail, title);
    await page.getByPlaceholder("Mensagem em Markdown").fill("Mensagem mobile enviada pelo Playwright.");
    await clickTouchable(page, "Enviar");
    await expect(page.getByText("Mensagem mobile enviada pelo Playwright.", { exact: true })).toBeVisible();
  });

  test("professor cria, inicia e conclui tarefa pela UI", async ({ page, request }) => {
    const fixture = await createUsers(request);
    const title = `TCC Tarefa ${fixture.stamp}`;
    const taskTitle = `Tarefa UI ${fixture.stamp}`;
    const solicitacao = await createSolicitacao(request, fixture, title);
    await acceptSolicitacao(request, fixture, solicitacao);

    await openSolicitacao(page, fixture.professorEmail, title);
    await clickTouchable(page, "...");
    await clickTouchable(page, "Adicionar tarefa");
    await page.locator("input").nth(0).fill(taskTitle);
    await page.locator("textarea").last().fill("Validar status em mobile.");
    await clickTouchable(page, "Salvar tarefa");
    await clickTouchable(page, "Tarefas");
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
    await clickTouchable(page, "Alterar status");
    await clickTouchable(page, "Confirmar Em progresso");
    await expect(page.getByText("Confirmar alteracao de status", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Em progresso", { exact: true })).toBeVisible();
    await clickTouchable(page, "Alterar status");
    await clickTouchable(page, "Confirmar Concluida");
    await expect(page.getByText("Confirmar alteracao de status", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Nenhuma tarefa ativa.", { exact: true })).toBeVisible();
  });

  test("layout mobile mantem login, home e perfil navegaveis em 390x844", async ({ page, request }) => {
    const fixture = await createUsers(request);
    expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
    await loginUi(page, fixture.alunoEmail);
    await expect(page.getByText(fixture.alunoNome, { exact: true })).toBeVisible();
    await clickTouchable(page, "Perfil");
    await expect(page.getByText(fixture.alunoEmail, { exact: true })).toBeVisible();
    await expect(page.getByText("Sair", { exact: true })).toBeVisible();
  });
});

test.describe("Video demonstrativo", () => {
  test("passo a passo completo em ate 1m30", async ({ page, request }) => {
    test.setTimeout(90_000);
    const fixture = await createUsers(request);
    const title = `Demo TCC ${fixture.stamp}`;
    const taskTitle = `Revisar metodologia ${fixture.stamp}`;

    await createSolicitacaoUi(page, fixture, title);
    await pauseDemo(page);
    await clickTouchable(page, "...");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Fechar");
    await page.goBack();
    await page.goBack();
    await clickTouchable(page, "Perfil");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Sair");
    await pauseDemo(page);

    await openSolicitacao(page, fixture.professorEmail, title);
    await pauseDemo(page);
    await clickTouchable(page, "...");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Aceitar");
    await clickTouchable(page, "Confirmar alteracao");
    await expect(page.getByText("Aceita", { exact: true })).toBeVisible();
    await pauseDemo(page);

    await page.getByPlaceholder("Mensagem em Markdown").fill("Oi, vamos organizar a primeira entrega.");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Enviar");
    await expect(page.getByText("Oi, vamos organizar a primeira entrega.", { exact: true })).toBeVisible();
    await pauseDemo(page);

    await clickTouchable(page, "...");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Adicionar tarefa");
    await page.locator("input").nth(0).fill(taskTitle);
    await page.locator("textarea").last().fill("Aluno deve revisar metodologia e marcar como concluida.");
    await pauseDemo(page);
    await clickTouchable(page, "Salvar tarefa");
    await clickTouchable(page, "Tarefas");
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
    await pauseDemo(page);
    await clickTouchable(page, "Alterar status");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Confirmar Em progresso");
    await expect(page.getByText("Confirmar alteracao de status", { exact: true })).not.toBeVisible();
    await pauseDemo(page);
    await clickTouchable(page, "Alterar status");
    await pauseDemo(page, 500);
    await clickTouchable(page, "Confirmar Concluida");
    await expect(page.getByText("Confirmar alteracao de status", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Nenhuma tarefa ativa.", { exact: true })).toBeVisible();
    await pauseDemo(page, 1200);
  });
});
