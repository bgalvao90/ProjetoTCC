# RELATÓRIO DE DIAGNÓSTICO DE SEGURANÇA — REACT NATIVE

**Aplicação:** ProjetoTCC  
**Versão:** 1.0.0  
**Data:** 16/06/2026  
**Auditor:** Codex  
**Escopo:** OWASP Mobile Top 10, análise estática do frontend e auditoria npm

## SUMÁRIO EXECUTIVO

O diagnóstico OWASP Mobile Top 10 identificou riscos relevantes no aplicativo React Native. Após a primeira auditoria, foram corrigidos 5 problemas priorizados, com evidência em código e validação por type-check e testes E2E.

Este relatório foi atualizado para não marcar como pendentes os itens que já foram corrigidos. Os achados ainda dependentes de backend, infraestrutura, upgrade maior de Expo/React Native, LGPD, pinning ou hardening nativo permanecem pendentes ou parcialmente corrigidos.

**Crítico:** 2  
**Alto:** 9  
**Médio:** 11  
**Baixo:** 0  
**Total original:** 22  
**Resolvidos:** 6  
**Parcialmente resolvidos:** 2  
**Pendentes:** 14  
**Score geral de risco atual:** [ ] Crítico [x] Alto [ ] Médio [ ] Baixo

### Status de resolução na entrega final

| Categoria | Achados | Resolvidos | Parcialmente resolvidos | Pendentes | Observação |
|---|---:|---:|---:|---:|---|
| M1 - Credenciais | 2 | 2 | 0 | 0 | JWT e perfil deixaram de ser persistidos em AsyncStorage |
| M2 - Supply chain | 4 | 1 | 1 | 2 | `axios` e `form-data` corrigidos; restam transitivas que exigem upgrade maior |
| M3 - Autenticação/autorização | 3 | 1 | 0 | 2 | Política de senha no cliente corrigida; sessão/autorização dependem do backend |
| M4 - Validação | 4 | 1 | 0 | 3 | Upload/download de anexos sanitizados; rotas, DTOs e links seguem pendentes |
| M5 - Comunicação | 2 | 1 | 0 | 1 | Cliente bloqueia HTTP em produção; pinning ainda pendente |
| M6 - Privacidade | 2 | 0 | 0 | 2 | Controles LGPD/consentimento não implementados |
| M7 - Proteção binária | 1 | 0 | 0 | 1 | Build final ainda precisa de verificação |
| M8 - Configuração | 2 | 0 | 1 | 1 | Mensagens de erro foram parcialmente tratadas; hardening de release segue pendente |
| M9 - Armazenamento | 2 | 0 | 0 | 2 | Cache temporário e proteção visual ainda exigem ajustes complementares |
| M10 - Criptografia | 0 | 0 | 0 | 0 | Nenhuma criptografia própria fraca encontrada |
| **Total** | **22** | **6** | **2** | **14** | **Status atualizado conforme evidência no código** |

**Conclusão de segurança:** a aplicação saiu do estado de “nenhum achado resolvido”. Foram corrigidos os principais problemas viáveis no frontend sem upgrade estrutural: armazenamento de credenciais/PII, bloqueio de HTTP em produção, validação de senha, validação/sanitização de anexos e dependências diretas vulneráveis. O risco residual continua **Alto** porque há pendências de backend/infraestrutura e vulnerabilidades transitivas no stack Expo/React Native.

### Validações executadas

- `npm audit --json`: executado antes e depois das correções.
- `npx tsc --noEmit`: aprovado.
- `npm run test:e2e`: aprovado com 7 testes em mobile Chromium.

### Escopo e limitações

- Foram analisados código TypeScript/JSON, assets, Git, `package.json`, `package-lock.json`, configuração Expo e dependências instaladas.
- A API/backend, CI/CD, APK/IPA final, regras CORS, rate limiting, política de privacidade publicada, TLS do servidor e cabeçalhos HTTP não foram completamente auditados neste relatório.
- O projeto usa Expo Managed; não existem `AndroidManifest.xml` e `Info.plist` versionados. Configurações nativas finais devem ser verificadas no artefato gerado.
- Não foram encontrados WebViews, Clipboard, OAuth/OIDC, biometria, analytics, localização, Firebase, Sentry, criptografia própria, certificados ou chaves privadas.
- `.env.local` contém apenas uma URL e está ignorado pelo Git. Não foram encontradas senhas, tokens, API keys ou chaves hardcoded rastreadas no repositório.

## ACHADOS

### ID: VULN-M1-001

**Categoria OWASP:** M1 — Improper Credential Usage  
**Severidade:** Alto  
**CWE:** CWE-312 / CWE-922  
**Componente afetado:** Armazenamento de autenticação  
**Causa raiz:** JWT bearer era persistido em armazenamento não criptográfico.  
**Evidência anterior:** `src/api/storage.ts` salvava e lia `auth.Token` com `AsyncStorage`.  
**Correção aplicada:** `src/api/storage.ts` agora mantém `memoryToken` somente em memória e remove chaves legadas `@ProjetoTCC:token` e `@ProjetoTCC:usuario`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Em dispositivo comprometido, backup indevido ou sessão Web, o atacante poderia extrair o token e assumir a sessão.  
**Recomendação residual:** Se persistência de sessão for requisito, usar Expo SecureStore/Keychain/Keystore com expiração e revogação no backend.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile + Backend  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M1-002

**Categoria OWASP:** M1 — Improper Credential Usage  
**Severidade:** Médio  
**CWE:** CWE-312  
**Componente afetado:** Cache do perfil  
**Causa raiz:** Perfil completo era tratado como dado comum persistente.  
**Evidência anterior:** `src/api/storage.ts` persistia `UsuarioDto`; `src/types.ts` contém nome, email e telefone.  
**Correção aplicada:** `src/api/storage.ts` agora mantém o usuário somente em `memoryUser` e remove o valor legado do AsyncStorage.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Acesso físico/root/backup expunha PII em texto claro.  
**Recomendação residual:** Minimizar cache e buscar perfil após login; caso precise persistir, usar armazenamento seguro com expiração.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M2-001

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Crítico  
**CWE:** CWE-78 / CWE-1104  
**Componente afetado:** `shell-quote`, transitiva de tooling React Native/Expo  
**Causa raiz:** Dependência transitiva vulnerável mantida no lockfile.  
**Evidência:** `npm audit --json` ainda reporta vulnerabilidade crítica residual.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Entrada maliciosa processada por tooling que usa `quote()` pode resultar em injeção de comando durante desenvolvimento/build.  
**Recomendação:** Atualizar a árvore Expo/React Native para versão compatível que resolva a dependência transitiva.  
**Prazo sugerido:** Imediato  
**Responsável:** DevOps + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-002

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Alto  
**CWE:** CWE-1321 / CWE-918 / CWE-1104  
**Componente afetado:** `axios` e `form-data`  
**Causa raiz:** Dependências diretas/transitivas abaixo das versões seguras disponíveis.  
**Evidência anterior:** `package.json` usava `axios@1.15.1`; `npm audit` apontava vulnerabilidades em `axios` e `form-data<4.0.6`.  
**Correção aplicada:** `package.json` atualiza `axios` para `^1.18.0` e fixa `form-data` em `^4.0.6`; `package-lock.json` registra as resoluções.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Respostas/configurações manipuladas poderiam sequestrar requests, vazar credenciais ou causar indisponibilidade.  
**Recomendação residual:** Manter `npm audit` no gate de release e revisar dependências diretas regularmente.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M2-003

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Alto  
**CWE:** CWE-91 / CWE-674 / CWE-1104  
**Componente afetado:** `@xmldom/xmldom`, transitiva do tooling Expo/iOS  
**Causa raiz:** Dependência transitiva vulnerável usada por tooling Expo/iOS.  
**Evidência:** `npm audit --json` ainda reporta vulnerabilidades transitivas.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** XML malicioso durante prebuild/configuração pode causar injeção de nós ou recursão não controlada.  
**Recomendação:** Atualizar para árvore Expo compatível ou aplicar override validado.  
**Prazo sugerido:** Curto prazo  
**Responsável:** DevOps + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-004

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Médio  
**CWE:** CWE-1104  
**Componente afetado:** Gerenciamento de dependências  
**Causa raiz:** Vulnerabilidades transitivas permanecem no lockfile.  
**Correção aplicada:** Vulnerabilidades diretas de `axios` e `form-data` foram resolvidas.  
**Pendência residual:** `npm audit --json` ainda retorna 26 vulnerabilidades, ligadas principalmente ao stack Expo/React Native e dependentes de upgrade maior.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Tooling vulnerável pode afetar build e release.  
**Recomendação:** Planejar upgrade controlado de Expo/React Native, SBOM, Dependabot/Renovate e gate de audit no CI.  
**Prazo sugerido:** Curto prazo  
**Responsável:** DevOps  
**Status:** [ ] Pendente [x] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-001

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Alto  
**CWE:** CWE-613  
**Componente afetado:** Ciclo de sessão JWT  
**Causa raiz:** Sessão restaurada pela simples presença de token+usuário; não há validação local de `exp`, renovação, introspecção ou revogação no logout.  
**Evidência:** `src/contexts/AuthContext.tsx` ainda depende do contrato de autenticação do backend.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Token roubado ou expirado pode permanecer reutilizável até rejeição do backend.  
**Recomendação:** Access token curto, refresh token rotativo protegido, validação de expiração, endpoint de revogação e lista de sessões.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-002

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Alto  
**CWE:** CWE-602 / CWE-862  
**Componente afetado:** Rotas e ações autorizadas  
**Causa raiz:** Proteção e papel são decididos no cliente; não há evidência executável da autorização correspondente no backend neste relatório.  
**Evidência:** A UI oculta ações por papel/status, mas autorização real precisa ser garantida nos endpoints.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Cliente adulterado chama endpoints diretamente, ignorando botões/rotas ocultos.  
**Recomendação:** Autorizar toda operação no backend por participante, papel, status e ownership.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-003

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Médio  
**CWE:** CWE-521  
**Componente afetado:** Cadastro e login  
**Causa raiz:** Política cliente aceitava senha com apenas seis caracteres.  
**Evidência anterior:** `src/screens/CadastroScreen.tsx` validava apenas tamanho mínimo fraco.  
**Correção aplicada:** `src/screens/CadastroScreen.tsx` usa `validatePassword`; `src/utils/validation.ts` exige mínimo de 8 caracteres, letra minúscula, letra maiúscula, número e caractere especial.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Credential stuffing ou brute force contra senhas fracas.  
**Recomendação residual:** Impor a mesma política no backend e adicionar rate limit/backoff/MFA opcional.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Backend + Mobile  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M4-001

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-20  
**Componente afetado:** Parâmetros de rota/deep link  
**Causa raiz:** IDs recebidos das rotas são convertidos com `Number()` sem validar inteiro positivo/faixa.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Deep link como `/solicitacoes/NaN` ou IDs extremos gera requests inválidos e pode explorar validação fraca no backend.  
**Recomendação:** Validar parâmetros com Zod antes de navegar/chamar serviços e rejeitar valores inválidos.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-002

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Alto  
**CWE:** CWE-434 / CWE-73  
**Componente afetado:** Upload e download de anexos  
**Causa raiz:** Cliente validava somente tamanho e confiava em nome/MIME fornecidos pelo picker.  
**Evidência anterior:** `src/screens/SolicitacaoDetalheScreen.tsx` e `src/services/anexoService.ts` não validavam extensão/MIME nem sanitizavam nome de forma central.  
**Correção aplicada:** `src/utils/validation.ts` adiciona `validateSelectedFile` e `sanitizeFileName`; `src/services/anexoService.ts` valida/sanitiza upload e download; `src/screens/SolicitacaoDetalheScreen.tsx` valida o arquivo selecionado antes do envio.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Arquivo executável renomeado, polyglot, nome com traversal ou CRLF poderia ser enviado ou manipular cache local.  
**Recomendação residual:** Validar também no backend, verificar assinatura real, escanear malware e apagar cache temporário após compartilhamento.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend + Mobile  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M4-003

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-20  
**Componente afetado:** Respostas de API  
**Causa raiz:** TypeScript fornece tipos em compilação, mas respostas Axios são aceitas sem validação runtime.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** API comprometida retorna tipos/campos inesperados, URLs ou conteúdo que quebram ou desviam a UI.  
**Recomendação:** Validar DTOs com Zod nas fronteiras dos services.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-004

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-319 / CWE-939  
**Componente afetado:** Links Markdown  
**Causa raiz:** Links `http://` são aceitos e abertos diretamente sem confirmação, allowlist ou bloqueio de destinos locais.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Link para phishing ou host local induz navegação insegura.  
**Recomendação:** Permitir apenas HTTPS, bloquear IPs locais/privados quando houver preview e pedir confirmação antes de abrir domínio externo.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M5-001

**Categoria OWASP:** M5 — Insecure Communication  
**Severidade:** Crítico  
**CWE:** CWE-319  
**Componente afetado:** API REST e SignalR  
**Causa raiz:** Endpoint podia usar HTTP; SignalR derivava a URL do mesmo endpoint.  
**Evidência anterior:** `.env.local` usava `http://192.168.100.2:8080`; `src/api/client.ts` não bloqueava HTTP em produção.  
**Correção aplicada:** `src/api/client.ts` valida `EXPO_PUBLIC_API_URL` e rejeita HTTP em produção; `src/services/realtimeService.ts` exige HTTPS/WSS em produção.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Em Wi-Fi compartilhado, ARP spoofing/proxy transparente captura email/senha, JWT, mensagens, PII e anexos.  
**Recomendação residual:** Publicar API em HTTPS/WSS real, configurar HSTS e revisar CORS por ambiente.  
**Prazo sugerido:** Imediato  
**Responsável:** Infra + Backend + Mobile  
**Status:** [ ] Pendente [ ] Em andamento [x] Corrigido [ ] Aceito

### ID: VULN-M5-002

**Categoria OWASP:** M5 — Insecure Communication  
**Severidade:** Alto  
**CWE:** CWE-295  
**Componente afetado:** Confiança TLS  
**Causa raiz:** Não há certificate/public-key pinning nem política documentada de rotação/fallback.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** CA comprometida ou certificado instalado no dispositivo permite MITM mesmo após migração para HTTPS.  
**Recomendação:** Após HTTPS estável, implementar pinning com dois pins e estratégia de rotação; validar no APK/IPA.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + Infra  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M6-001

**Categoria OWASP:** M6 — Inadequate Privacy Controls  
**Severidade:** Alto  
**CWE:** CWE-359  
**Componente afetado:** Governança LGPD/GDPR  
**Causa raiz:** Não há política, finalidade, retenção, revogação, exportação ou exclusão de conta/dados evidenciada no app/repositório.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Coleta e retenção sem transparência aumentam exposição e risco regulatório.  
**Recomendação:** Inventário de dados, base legal/finalidade, aviso de privacidade, retenção, direitos do titular, exclusão/exportação e controles técnicos.  
**Prazo sugerido:** Imediato  
**Responsável:** DPO/Jurídico + Produto + Engenharia  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M6-002

**Categoria OWASP:** M6 — Inadequate Privacy Controls  
**Severidade:** Médio  
**CWE:** CWE-359  
**Componente afetado:** Push notifications  
**Causa raiz:** O app solicita permissão e registra token push sem tela própria de finalidade/preferência/revogação.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Token de dispositivo é tratado sem ciclo explícito de consentimento e revogação.  
**Recomendação:** Explicar finalidade antes do prompt do SO, permitir opt-out, revogar token no backend e minimizar conteúdo sensível em notificações.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Produto + Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M7-001

**Categoria OWASP:** M7 — Insufficient Binary Protections  
**Severidade:** Médio  
**CWE:** CWE-693  
**Componente afetado:** Build Android/iOS  
**Causa raiz:** Hardening não está explicitamente codificado/verificável no artefato final.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Um atacante extrai o APK/IPA e analisa bundle, endpoints, contratos e lógica.  
**Recomendação:** Gerar builds release auditáveis, confirmar Hermes/minificação/R8, remover símbolos/source maps públicos e avaliar Play Integrity/App Attest.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile + DevOps  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M8-001

**Categoria OWASP:** M8 — Security Misconfiguration  
**Severidade:** Médio  
**CWE:** CWE-16  
**Componente afetado:** Configuração Expo/nativa/OTA  
**Causa raiz:** Controles de release não estão explícitos: canal/runtimeVersion OTA, política de updates, cleartext, backup e flags de produção não são versionados.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Build gerado com defaults inadequados pode aceitar backup, cleartext, debug ou update no canal errado.  
**Recomendação:** Codificar e revisar config plugins de segurança, canais assinados, runtimeVersion, política OTA, backups e tráfego cleartext.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + DevOps  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M8-002

**Categoria OWASP:** M8 — Security Misconfiguration  
**Severidade:** Médio  
**CWE:** CWE-209  
**Componente afetado:** Tratamento de erros  
**Causa raiz:** Mensagens textuais do backend e `Error.message` eram exibidas diretamente ao usuário em vários fluxos.  
**Correção aplicada:** `getErrorMessage()` agora trata alguns status HTTP comuns, mensagens estruturadas e erros de validação de forma mais segura.  
**Pendência residual:** Ainda é necessário mapear códigos de erro do backend para mensagens totalmente padronizadas e sanitizadas.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Backend mal configurado pode retornar stack trace, SQL, IDs internos ou detalhes de infraestrutura.  
**Recomendação:** Mapear códigos de erro para mensagens seguras; registrar detalhes somente em telemetria sanitizada e restrita.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Backend + Mobile  
**Status:** [ ] Pendente [x] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M9-001

**Categoria OWASP:** M9 — Insecure Data Storage  
**Severidade:** Alto  
**CWE:** CWE-22 / CWE-922  
**Componente afetado:** Download/cache de anexos  
**Causa raiz:** Nome de arquivo remoto era concatenado ao cache sem sanitização; o arquivo permanece após compartilhamento.  
**Correção aplicada:** `src/services/anexoService.ts` usa `sanitizeFileName()` no nome do arquivo local.  
**Pendência residual:** O arquivo temporário ainda não é removido em `finally` após o compartilhamento.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Nome como `../arquivo` tentava escapar do diretório esperado; dispositivo comprometido pode recuperar anexos residuais do cache.  
**Recomendação:** Gerar nome local aleatório, remover separadores, validar extensão, usar diretório privado e apagar o arquivo em `finally` após o compartilhamento.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M9-002

**Categoria OWASP:** M9 — Insecure Data Storage  
**Severidade:** Médio  
**CWE:** CWE-200  
**Componente afetado:** Proteção visual de telas sensíveis  
**Causa raiz:** Não há bloqueio de screenshots/recents em telas com PII, mensagens e anexos.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Snapshot de recents, gravação de tela ou app malicioso captura informações exibidas.  
**Recomendação:** Aplicar proteção em telas realmente sensíveis, ocultar conteúdo ao ir para background e documentar exceções de UX/acessibilidade.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile + Produto  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

## M10 — RESULTADO CRIPTOGRÁFICO

Não foram encontrados MD5, SHA-1, DES, 3DES, RC4, ECB, `Math.random()` para segurança, chaves hardcoded ou criptografia caseira no frontend. O app não implementa criptografia própria; depende de TLS, JWT e controles do backend. A efetividade completa desses controles depende de auditoria da API e infraestrutura.

## PLANO DE REMEDIAÇÃO

**Prioridade 1 — Imediato:**

1. Resolver vulnerabilidades transitivas críticas/altas restantes por upgrade controlado de Expo/React Native.
2. Publicar API/SignalR em HTTPS/WSS real e validar HSTS/CORS no backend.
3. Confirmar autorização server-side por participante, papel, status e ownership.
4. Remover arquivos temporários de anexos após compartilhamento.
5. Validar LGPD: política, consentimento, retenção, exclusão/exportação.

**Prioridade 2 — Curto prazo:**

1. Implementar pinning com rotação após estabilizar HTTPS.
2. Validar DTOs e parâmetros de rota com Zod.
3. Bloquear links `http://`/destinos locais em Markdown.
4. Codificar configuração segura de release/OTA.
5. Mapear erros do backend para mensagens seguras.

**Prioridade 3 — Médio prazo:**

1. Gerar SBOM e aplicar gates de audit no CI.
2. Revisar hardening binário, screenshots e source maps.
3. Adicionar SecureStore/Keychain caso sessão persistente volte a ser requisito.
4. Reauditar APK/IPA final antes do release.

**Re-auditoria agendada para:** após upgrade do stack Expo/React Native ou antes do próximo release mobile nativo.

## APÊNDICE A — SUMÁRIO M2 SUPPLY CHAIN

**Score geral da supply chain:** Alto

| Pacote | Status atual | Severidade/advisory | Ação |
|---|---|---|---|
| `axios` | Corrigido para `^1.18.0` | Alta | Manter atualizado e coberto por testes |
| `form-data` | Corrigido para `^4.0.6` | Alta | Manter fixado enquanto necessário |
| `shell-quote` | Pendente, transitiva | Crítica | Upgrade Expo/React Native/dependência transitiva |
| `@xmldom/xmldom` | Pendente, transitiva | Alta | Override validado ou upgrade Expo |
| Expo/tooling e transitivas | Pendente | Moderadas/altas residuais | Planejar upgrade e gate CI |

## APÊNDICE B — FLUXO DE AUTENTICAÇÃO

### Atual após correção

```text
LoginScreen -> POST /auth/login -> recebe Token + Usuario
  -> authStorage mantém Token + Usuario em memória
  -> remove chaves legadas do AsyncStorage
  -> interceptor injeta Bearer enquanto houver sessão em memória
  -> 401 limpa estado local
  -> logout limpa memória e chaves legadas
```

### Recomendado para evolução

```text
Login + rate limit/MFA -> access token curto + refresh token rotativo
  -> access token em memória; refresh token, se existir, em SecureStore
  -> validar expiração/issuer/audience conforme contrato
  -> refresh rotativo e detecção de reutilização
  -> backend autoriza cada recurso/ação
  -> logout revoga sessão no servidor e limpa armazenamento
```

## APÊNDICE C — ITENS CORRIGIDOS NESTA ENTREGA

| Item | Arquivos principais | Status |
|---|---|---|
| JWT e perfil fora do AsyncStorage | `src/api/storage.ts` | Corrigido |
| Bloqueio de HTTP em produção | `src/api/client.ts`, `src/services/realtimeService.ts` | Corrigido |
| Política de senha no cadastro | `src/screens/CadastroScreen.tsx`, `src/utils/validation.ts` | Corrigido |
| Validação/sanitização de anexos | `src/utils/validation.ts`, `src/services/anexoService.ts`, `src/screens/SolicitacaoDetalheScreen.tsx` | Corrigido |
| Dependências `axios` e `form-data` | `package.json`, `package-lock.json` | Corrigido |

## APÊNDICE D — MAPEAMENTO DOS PROMPTS

| OWASP | Resultado principal |
|---|---|
| M1 | 2 achados corrigidos no frontend; sessão persistente deve usar SecureStore se voltar a ser exigida |
| M2 | Dependências diretas corrigidas; transitivas ainda exigem upgrade maior |
| M3 | Senha corrigida no cliente; sessão/autorização dependem do backend |
| M4 | Upload/download de anexos corrigidos; rotas, DTOs e links seguem pendentes |
| M5 | Bloqueio de HTTP em produção corrigido no cliente; HTTPS real/pinning ainda dependem de infra/build |
| M6 | Governança LGPD/consentimento/retenção não evidenciada |
| M7 | Hardening do binário final não está codificado/verificável |
| M8 | Erros parcialmente tratados; configuração nativa/OTA precisa hardening |
| M9 | Token/PII corrigidos em M1; cache temporário e screenshots ainda pendentes |
| M10 | Nenhuma criptografia fraca própria encontrada; backend/TLS não auditáveis por completo |
