import { expect, test, type Page, type Route } from "@playwright/test";

const apiUrl = "http://192.168.100.2:8080";
const evidenceDir = "evidencias/playwright";

const aluno = {
  UsuarioId: 1,
  PessoaId: 1,
  NomeCompleto: "Aluno Playwright",
  Email: "aluno.playwright@teste.local",
  Telefone: "11999990001",
  UniversidadeId: 1,
  TipoUsuario: "Aluno",
  Ativo: true,
};

const professor = {
  UsuarioId: 2,
  PessoaId: 2,
  NomeCompleto: "Professor Playwright",
  Email: "professor.playwright@teste.local",
  Telefone: "11999990002",
  UniversidadeId: 1,
  TipoUsuario: "Professor",
  Ativo: true,
};

type MockState = {
  currentUserId: number;
  solicitacao: Record<string, unknown> | null;
  tarefas: Array<Record<string, unknown>>;
  timeline: Array<Record<string, unknown>>;
};

function createSolicitacao(statusId = 1) {
  const status = {
    1: "Pendente",
    2: "EmAndamento",
    3: "Recusada",
    4: "Finalizada",
    5: "Pausada",
  }[statusId];
  return {
    SolicitacaoId: 101,
    AlunoUsuarioId: aluno.UsuarioId,
    ProfessorUsuarioId: professor.UsuarioId,
    AlunoNome: aluno.NomeCompleto,
    ProfessorNome: professor.NomeCompleto,
    TituloTcc: "TCC Playwright - ciclo completo",
    DescricaoTema: "Validacao automatizada do ciclo da orientacao.",
    StatusId: statusId,
    Status: status,
    DataCriacao: new Date().toISOString(),
    Versao: 1,
    Participantes: [
      { UsuarioId: aluno.UsuarioId, Nome: aluno.NomeCompleto, Papel: "Aluno", Ativo: true, AdicionadoEm: new Date().toISOString() },
      { UsuarioId: professor.UsuarioId, Nome: professor.NomeCompleto, Papel: "Professor", Ativo: true, AdicionadoEm: new Date().toISOString() },
    ],
  };
}

function createTarefa(statusId = 1) {
  return {
    TarefaId: 501,
    SolicitacaoId: 101,
    Titulo: "Revisar capitulo de metodologia",
    Descricao: "Revisar estrutura, referencias e resultados esperados.",
    StatusId: statusId,
    ResponsavelUsuarioId: professor.UsuarioId,
    PossuiMidia: false,
    MidiaId: null,
    DataCriacao: new Date().toISOString(),
    DataAlteracao: statusId > 1 ? new Date().toISOString() : null,
    DataConclusao: statusId === 3 ? new Date().toISOString() : null,
  };
}

function createState(statusId?: number, taskStatusId?: number): MockState {
  return {
    currentUserId: aluno.UsuarioId,
    solicitacao: statusId ? createSolicitacao(statusId) : null,
    tarefas: taskStatusId ? [createTarefa(taskStatusId)] : [],
    timeline: [],
  };
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

function statusName(statusId: number) {
  return { 1: "Pendente", 2: "EmAndamento", 3: "Recusada", 4: "Finalizada", 5: "Pausada" }[statusId];
}

async function installMockApi(page: Page, state: MockState) {
  await page.route(`${apiUrl}/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = request.postDataJSON?.() as Record<string, unknown> | number | undefined;

    if (path === "/auth/login" && method === "POST") {
      const email = String((body as Record<string, unknown>).Email);
      const user = email.startsWith("professor") ? professor : aluno;
      state.currentUserId = user.UsuarioId;
      return json(route, { Token: `token-${user.UsuarioId}`, Usuario: user });
    }
    if (path === "/professores" && method === "GET") return json(route, [professor]);
    if (path === `/professores/${professor.UsuarioId}` && method === "GET") return json(route, professor);
    if (path === "/universidades" && method === "GET") return json(route, [{ UniversidadeId: 1, Nome: "Universidade Teste" }]);
    if (path === "/solicitacoes/minhas" && method === "GET") return json(route, state.solicitacao ? [state.solicitacao] : []);
    if (path === "/solicitacoes" && method === "POST") {
      state.solicitacao = {
        ...createSolicitacao(1),
        TituloTcc: (body as Record<string, unknown>).TituloTcc,
        DescricaoTema: (body as Record<string, unknown>).DescricaoTema,
      };
      return json(route, state.solicitacao, 201);
    }
    if (path === "/solicitacoes/101" && method === "GET") return json(route, state.solicitacao);
    if (path === "/solicitacoes/101/status" && method === "PUT") {
      const statusId = Number((body as Record<string, unknown>).NovoStatusId);
      Object.assign(state.solicitacao!, {
        StatusId: statusId,
        Status: statusName(statusId),
        Versao: Number(state.solicitacao!.Versao) + 1,
      });
      return json(route, state.solicitacao);
    }
    if (path === "/solicitacoes/101/tarefas" && method === "GET") return json(route, state.tarefas);
    if (path === "/solicitacoes/101/tarefas" && method === "POST") {
      const requestBody = body as Record<string, unknown>;
      const tarefa = { ...createTarefa(1), Titulo: requestBody.Titulo, Descricao: requestBody.Descricao };
      state.tarefas.push(tarefa);
      return json(route, tarefa, 201);
    }
    if (path === "/solicitacoes/101/tarefas/501/status" && method === "PUT") {
      const parsedBody = typeof body === "number" ? body : JSON.parse(request.postData() ?? "null");
      const statusId = Number(parsedBody);
      Object.assign(state.tarefas[0], {
        StatusId: statusId,
        DataAlteracao: new Date().toISOString(),
        DataConclusao: statusId === 3 ? new Date().toISOString() : null,
      });
      return json(route, state.tarefas[0]);
    }
    if (path === "/solicitacoes/101/timeline" && method === "GET") {
      return json(route, { Itens: state.timeline, ProximoCursor: null });
    }
    if (path.includes("/hubs/projetotcc/negotiate")) {
      return json(route, { connectionId: "mock", connectionToken: "mock", availableTransports: [] });
    }
    return json(route, {});
  });
}

async function login(page: Page, email: string) {
  await page.goto("/");
  const inputs = page.locator("input");
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill("senha123");
  await page.getByText("Entrar", { exact: true }).click();
  await expect(page.getByText("Bem Vindo!", { exact: true })).toBeVisible();
}

async function openSolicitacao(page: Page, email: string) {
  await login(page, email);
  await page.getByText(email === professor.Email ? "Solicitações recebidas" : "Minhas solicitações", { exact: true }).click();
  await page.getByText("TCC Playwright - ciclo completo", { exact: true }).click();
}

async function confirmStatusChange(page: Page, action: string) {
  await page.getByText("...", { exact: true }).click();
  await page.getByText(action, { exact: true }).click();
  await page.getByText("Confirmar alteracao", { exact: true }).last().click();
  await expect(page.getByText("Confirmar alteracao", { exact: true }).first()).not.toBeVisible();
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: true });
}

test.describe("Entrega final - 10 casos Playwright", () => {
  test("E2E-001 - aluno realiza login", async ({ page }) => {
    await installMockApi(page, createState());
    await login(page, aluno.Email);
    await expect(page.getByText(aluno.NomeCompleto, { exact: true })).toBeVisible();
    await screenshot(page, "01-login-aluno");
  });

  test("E2E-002 - professor realiza login", async ({ page }) => {
    await installMockApi(page, createState());
    await login(page, professor.Email);
    await expect(page.getByText(professor.NomeCompleto, { exact: true })).toBeVisible();
    await screenshot(page, "02-login-professor");
  });

  test("E2E-003 - aluno visualiza lista vazia de solicitacoes", async ({ page }) => {
    await installMockApi(page, createState());
    await login(page, aluno.Email);
    await page.getByText("Minhas solicitações", { exact: true }).click();
    await expect(page.getByText("Nenhuma solicitacao", { exact: true })).toBeVisible();
    await screenshot(page, "03-lista-solicitacoes-vazia");
  });

  test("E2E-004 - aluno cria solicitacao", async ({ page }) => {
    await installMockApi(page, createState());
    await login(page, aluno.Email);
    await page.getByText("Minhas solicitações", { exact: true }).click();
    await page.getByText("Nova solicitação", { exact: true }).click();
    await page.getByText("Selecione um professor", { exact: true }).click();
    await page.getByText(professor.NomeCompleto, { exact: true }).click();
    await page.locator("input").nth(0).fill("TCC Playwright - ciclo completo");
    await page.locator("textarea").fill("Validacao automatizada do ciclo da orientacao.");
    await page.getByText("Enviar solicitação", { exact: true }).click();
    await expect(page.getByText("Pendente", { exact: true })).toBeVisible();
    await screenshot(page, "04-solicitacao-criada");
  });

  test("E2E-005 - solicitacao pendente fica somente leitura", async ({ page }) => {
    await installMockApi(page, createState(1));
    await openSolicitacao(page, aluno.Email);
    await expect(page.getByText(/Orientacao em modo somente leitura: Pendente/)).toBeVisible();
    await screenshot(page, "05-solicitacao-pendente-somente-leitura");
  });

  test("E2E-006 - professor aceita solicitacao", async ({ page }) => {
    await installMockApi(page, createState(1));
    await openSolicitacao(page, professor.Email);
    await confirmStatusChange(page, "Aceitar");
    await expect(page.getByText("EmAndamento", { exact: true })).toBeVisible();
    await screenshot(page, "06-solicitacao-aceita");
  });

  test("E2E-007 - professor cria tarefa", async ({ page }) => {
    await installMockApi(page, createState(2));
    await openSolicitacao(page, professor.Email);
    await page.getByText("...", { exact: true }).click();
    await page.getByText("Adicionar tarefa", { exact: true }).click();
    await page.locator("input").nth(0).fill("Revisar capitulo de metodologia");
    await page.locator("textarea").last().fill("Revisar estrutura, referencias e resultados esperados.");
    await page.getByText("Salvar tarefa", { exact: true }).click();
    await page.getByText("Tarefas", { exact: true }).click();
    await expect(page.getByText("Revisar capitulo de metodologia", { exact: true })).toBeVisible();
    await screenshot(page, "07-tarefa-criada");
  });

  test("E2E-008 - tarefa avanca para em progresso", async ({ page }) => {
    await installMockApi(page, createState(2, 1));
    await openSolicitacao(page, professor.Email);
    await page.getByText("Tarefas", { exact: true }).click();
    await page.getByText("Alterar status", { exact: true }).click();
    await page.getByText("Confirmar Em progresso", { exact: true }).click();
    await expect(page.getByText("Em progresso", { exact: true })).toBeVisible();
    await screenshot(page, "08-tarefa-em-progresso");
  });

  test("E2E-009 - tarefa e concluida e sai do painel ativo", async ({ page }) => {
    await installMockApi(page, createState(2, 2));
    await openSolicitacao(page, professor.Email);
    await page.getByText("Tarefas", { exact: true }).click();
    await page.getByText("Alterar status", { exact: true }).click();
    await page.getByText("Confirmar Concluida", { exact: true }).click();
    await expect(page.getByText("Nenhuma tarefa ativa.", { exact: true })).toBeVisible();
    await screenshot(page, "09-tarefa-concluida");
  });

  test("E2E-010 - professor finaliza solicitacao", async ({ page }) => {
    await installMockApi(page, createState(2, 3));
    await openSolicitacao(page, professor.Email);
    await confirmStatusChange(page, "Finalizar");
    await expect(page.getByText("Finalizada", { exact: true })).toBeVisible();
    await expect(page.getByText(/Orientacao em modo somente leitura: Finalizada/)).toBeVisible();
    await screenshot(page, "10-solicitacao-finalizada");
  });
});
