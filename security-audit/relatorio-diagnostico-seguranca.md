# RELATÓRIO DE DIAGNÓSTICO DE SEGURANÇA — REACT NATIVE

**Aplicação:** ProjetoTCC  
**Versão:** 1.0.0  
**Data:** 15/06/2026  
**Auditor:** Codex  
**Escopo:** OWASP Mobile Top 10, análise estática do frontend e auditoria npm

## SUMÁRIO EXECUTIVO

**Crítico:** 2  
**Alto:** 9  
**Médio:** 11  
**Baixo:** 0  
**Total:** 22  
**Score geral de risco:** [ ] Crítico [x] Alto [ ] Médio [ ] Baixo

O risco geral é **Alto**. O cenário mais urgente é o uso de
`http://192.168.100.2:8080`, que permite interceptar credenciais, JWT, PII, mensagens
e anexos. O token e o perfil também são persistidos em texto claro via
`AsyncStorage`. A supply chain possui 19 vulnerabilidades reportadas por
`npm audit`, incluindo 1 crítica, 2 altas e 16 moderadas.

### Status de resolução na entrega final

| Categoria | Achados | Resolvidos | Não resolvidos | Observação |
|---|---:|---:|---:|---|
| M1 - Credenciais | 2 | 0 | 2 | Token e PII continuam no AsyncStorage |
| M2 - Supply chain | 4 | 0 | 4 | Audit ainda possui vulnerabilidades críticas/altas |
| M3 - Autenticação/autorização | 3 | 0 | 3 | Depende de mudanças no backend e sessão |
| M4 - Validação | 4 | 0 | 4 | Rotas, uploads, links e DTOs permanecem pendentes |
| M5 - Comunicação | 2 | 0 | 2 | Endpoint atual continua HTTP e sem pinning |
| M6 - Privacidade | 2 | 0 | 2 | Controles LGPD/consentimento não implementados |
| M7 - Proteção binária | 1 | 0 | 1 | Build final ainda precisa de verificação |
| M8 - Configuração | 2 | 0 | 2 | Hardening de release e erros pendente |
| M9 - Armazenamento | 2 | 0 | 2 | Cache e proteção visual pendentes |
| M10 - Criptografia | 0 | 0 | 0 | Nenhuma criptografia própria fraca encontrada |
| **Total** | **22** | **0** | **22** | **Nenhum achado foi marcado como resolvido sem evidência** |

**Conclusão de segurança:** os itens OWASP foram diagnosticados e documentados, mas
os 22 achados permanecem **Não resolvidos/Pendentes** nesta versão. As correções
exigem priorização formal, alterações de infraestrutura/backend e nova auditoria.

### Escopo e limitações

- Foram analisados código TypeScript/JSON, assets, Git, `package.json`,
  `package-lock.json`, configuração Expo e dependências instaladas.
- A API/backend, CI/CD, APK/IPA final, regras CORS, rate limiting, política de
  privacidade publicada, TLS do servidor e cabeçalhos HTTP não estavam disponíveis.
- O projeto usa Expo Managed; não existem `AndroidManifest.xml` e `Info.plist`
  versionados. Configurações nativas finais devem ser verificadas no artefato gerado.
- Não foram encontrados WebViews, Clipboard, OAuth/OIDC, biometria, analytics,
  localização, Firebase, Sentry, criptografia própria, certificados ou chaves privadas.
- `.env.local` contém apenas uma URL e está ignorado pelo Git. Não foram encontradas
  senhas, tokens, API keys ou chaves hardcoded rastreadas no repositório.

## ACHADOS

### ID: VULN-M1-001

**Categoria OWASP:** M1 — Improper Credential Usage  
**Severidade:** Alto  
**CWE:** CWE-312  
**Componente afetado:** Armazenamento de autenticação  
**Causa raiz:** JWT bearer persistido em armazenamento não criptográfico.  
**Evidência (arquivo/linha):** `src/api/storage.ts:1,8-15` salva e lê
`auth.Token` com `AsyncStorage`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Em dispositivo comprometido, backup indevido ou sessão Web,
o atacante extrai o token e assume a sessão.  
**Recomendação:** Migrar o token para Expo SecureStore/Keychain/Keystore, limitar
vida útil e revogar sessões no servidor.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M1-002

**Categoria OWASP:** M1 — Improper Credential Usage  
**Severidade:** Médio  
**CWE:** CWE-312  
**Componente afetado:** Cache do perfil  
**Causa raiz:** Perfil completo tratado como dado comum persistente.  
**Evidência (arquivo/linha):** `src/api/storage.ts:9-12,17-22` persiste
`UsuarioDto`; `src/types.ts:3-12` contém nome, email e telefone.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Acesso físico/root/backup expõe PII em texto claro.  
**Recomendação:** Minimizar o cache; buscar perfil após login ou proteger somente
o mínimo necessário com armazenamento seguro e expiração.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-001

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Crítico  
**CWE:** CWE-78 / CWE-1104  
**Componente afetado:** `shell-quote@1.8.3`, transitiva de `react-devtools-core`  
**Causa raiz:** Dependência transitiva vulnerável mantida no lockfile.  
**Evidência (arquivo/linha):** `package-lock.json:9730-9732`; `npm audit` reporta
GHSA-w7jw-789q-3m8p, CVSS 8.1, severidade crítica.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Entrada maliciosa processada por tooling que usa `quote()` pode
resultar em injeção de comando durante desenvolvimento/build.  
**Recomendação:** Atualizar a árvore Expo/React Native para versão que resolva a
dependência e bloquear builds enquanto a vulnerabilidade crítica persistir.  
**Prazo sugerido:** Imediato  
**Responsável:** DevOps + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-002

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Alto  
**CWE:** CWE-1321 / CWE-918 / CWE-1104  
**Componente afetado:** `axios@1.15.1`  
**Causa raiz:** Dependência direta abaixo da versão segura disponível.  
**Evidência (arquivo/linha):** `package.json:17`, `package-lock.json:3706-3708`;
`npm audit` reporta múltiplos GHSAs de credential leak, MITM, SSRF/proxy bypass,
prototype pollution e DoS, CVSS até 8.7.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Respostas/configurações manipuladas podem sequestrar requests,
vazar credenciais ou causar indisponibilidade.  
**Recomendação:** Atualizar para `axios@1.18.0` ou no mínimo `>=1.16.0`, validar
compatibilidade e executar testes de regressão.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-003

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Alto  
**CWE:** CWE-91 / CWE-674 / CWE-1104  
**Componente afetado:** `@xmldom/xmldom@0.8.12`  
**Causa raiz:** Dependência transitiva vulnerável usada por tooling Expo/iOS.  
**Evidência (arquivo/linha):** `package-lock.json:3505-3507`; `npm audit` reporta
GHSA-2v35-w6hq-6mfw, GHSA-f6ww-3ggp-fr8h, GHSA-x6wf-f3px-wcqx e
GHSA-j759-j44w-7fr8.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** XML malicioso durante prebuild/configuração pode causar injeção
de nós ou recursão não controlada.  
**Recomendação:** Atualizar para `@xmldom/xmldom>=0.8.13` por override validado ou
upgrade compatível do Expo.  
**Prazo sugerido:** Curto prazo  
**Responsável:** DevOps + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M2-004

**Categoria OWASP:** M2 — Inadequate Supply Chain Security  
**Severidade:** Médio  
**CWE:** CWE-1104  
**Componente afetado:** Gerenciamento de dependências  
**Causa raiz:** Dependências diretas usam majoritariamente `^`/`~`; 16
vulnerabilidades moderadas permanecem no lockfile.  
**Evidência (arquivo/linha):** `package.json:12-39`; `npm audit`: total 19
vulnerabilidades. Lockfile v3 existe e `npm ls --depth=0` foi consistente.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Atualizações automáticas ou transitivas comprometidas entram em
novas instalações; tooling vulnerável afeta build e release.  
**Recomendação:** Fixar versões críticas, usar Renovate/Dependabot, SBOM, revisão de
lockfile, `npm ci`, assinatura/proveniência e gate de audit no CI.  
**Prazo sugerido:** Curto prazo  
**Responsável:** DevOps  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-001

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Alto  
**CWE:** CWE-613  
**Componente afetado:** Ciclo de sessão JWT  
**Causa raiz:** Sessão restaurada pela simples presença de token+usuário; não há
validação local de `exp`, renovação, introspecção ou revogação no logout.  
**Evidência (arquivo/linha):** `src/contexts/AuthContext.tsx:26-31,42-55,71-73`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Token roubado ou expirado permanece reutilizável até rejeição do
backend; logout remove somente o estado local.  
**Recomendação:** Access token curto, refresh token rotativo protegido, validação de
expiração, endpoint de revogação e lista de sessões.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-002

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Alto  
**CWE:** CWE-602 / CWE-862  
**Componente afetado:** Rotas e ações autorizadas  
**Causa raiz:** Proteção e papel são decididos no cliente; não há evidência executável
da autorização correspondente no backend.  
**Evidência (arquivo/linha):** `src/screens/Screen.tsx:18-30`;
`src/screens/SolicitacaoDetalheScreen.tsx:93-97,186-200`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Cliente adulterado chama endpoints diretamente, ignorando
botões/rotas ocultos.  
**Recomendação:** Autorizar toda operação no backend por participante, papel, status
e ownership; o cliente deve ser apenas UX. Testar 401/403 por contrato.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M3-003

**Categoria OWASP:** M3 — Insecure Authentication/Authorization  
**Severidade:** Médio  
**CWE:** CWE-521  
**Componente afetado:** Cadastro e login  
**Causa raiz:** Política cliente aceita senha com apenas seis caracteres; rate
limiting/MFA/bloqueio não puderam ser confirmados.  
**Evidência (arquivo/linha):** `src/screens/CadastroScreen.tsx:36-40`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Credential stuffing ou brute force contra senhas fracas.  
**Recomendação:** Política baseada em comprimento, senhas comprometidas, rate limit,
backoff, MFA opcional e mensagens de erro não enumeráveis no backend.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-001

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-20  
**Componente afetado:** Parâmetros de rota/deep link  
**Causa raiz:** IDs recebidos das rotas são convertidos com `Number()` sem validar
inteiro positivo/faixa.  
**Evidência (arquivo/linha):** `src/screens/SolicitacaoDetalheScreen.tsx:35-37`;
`src/screens/ChatScreen.tsx:17-20`; `src/screens/ProfessorDetalheScreen.tsx:17-18`;
`src/screens/CriarSolicitacaoScreen.tsx:16-19`.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Deep link como `/solicitacoes/NaN` ou IDs extremos gera requests
inválidos e pode explorar validação fraca no backend.  
**Recomendação:** Validar parâmetros com Zod antes de navegar/chamar serviços e
rejeitar valores inválidos.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-002

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Alto  
**CWE:** CWE-434  
**Componente afetado:** Upload de anexos  
**Causa raiz:** Cliente valida somente tamanho e confia em nome/MIME fornecidos pelo
picker; não valida extensão, assinatura, ZIP ou executáveis.  
**Evidência (arquivo/linha):** `src/screens/SolicitacaoDetalheScreen.tsx:118-126`;
`src/services/anexoService.ts:7-18`.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Arquivo executável renomeado como PDF, polyglot ou ZIP bomb é
enviado com MIME forjado.  
**Recomendação:** Validar allowlist, assinatura real, tamanho descompactado, malware
e autorização no servidor; cliente fornece apenas feedback antecipado.  
**Prazo sugerido:** Imediato  
**Responsável:** Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-003

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-20  
**Componente afetado:** Respostas de API  
**Causa raiz:** TypeScript fornece tipos em compilação, mas respostas Axios são
aceitas sem validação runtime.  
**Evidência (arquivo/linha):** Serviços em `src/services/*.ts`, por exemplo
`src/services/orientacaoService.ts:9-32`; renderização em
`src/components/TimelineItem.tsx`.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** API comprometida retorna tipos/campos inesperados, URLs ou
conteúdo que quebram ou desviam a UI.  
**Recomendação:** Validar DTOs com Zod nas fronteiras dos services e rejeitar dados
fora do contrato.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M4-004

**Categoria OWASP:** M4 — Insufficient Input/Output Validation  
**Severidade:** Médio  
**CWE:** CWE-319 / CWE-939  
**Componente afetado:** Links Markdown  
**Causa raiz:** Links `http://` são aceitos e abertos diretamente sem confirmação,
allowlist ou bloqueio de destinos locais.  
**Evidência (arquivo/linha):** `src/components/MarkdownContent.tsx:8-21`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Payload `http://phishing.example/login` ou URL para host local
induz navegação insegura/phishing. HTML bruto está desabilitado, reduzindo XSS direto.  
**Recomendação:** Permitir apenas HTTPS, bloquear IPs locais/privados quando houver
preview e pedir confirmação antes de abrir domínio externo.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M5-001

**Categoria OWASP:** M5 — Insecure Communication  
**Severidade:** Crítico  
**CWE:** CWE-319  
**Componente afetado:** API REST e SignalR  
**Causa raiz:** Endpoint atual usa HTTP; SignalR deriva a URL do mesmo endpoint.  
**Evidência (arquivo/linha):** `.env.local:1`;
`src/api/client.ts:4,10-13,26-29`; `src/services/realtimeService.ts:13-21`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [x] Alto [ ] Médio [ ] Baixo  
**Vetor de ataque:** Em Wi-Fi compartilhado, ARP spoofing/proxy transparente captura
email/senha, JWT, mensagens, PII e anexos e pode alterar respostas.  
**Recomendação:** Exigir HTTPS/WSS com TLS 1.2+, HSTS no domínio Web, rejeitar
cleartext no build e separar configuração segura por ambiente.  
**Prazo sugerido:** Imediato  
**Responsável:** Infra + Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M5-002

**Categoria OWASP:** M5 — Insecure Communication  
**Severidade:** Alto  
**CWE:** CWE-295  
**Componente afetado:** Confiança TLS  
**Causa raiz:** Não há certificate/public-key pinning nem política documentada de
rotação/fallback.  
**Evidência (arquivo/linha):** Ausência de biblioteca/config plugin de pinning em
`package.json` e `app.json`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** CA comprometida ou certificado instalado no dispositivo permite
MITM mesmo após migração para HTTPS.  
**Recomendação:** Após HTTPS estável, implementar pinning com dois pins e estratégia
de rotação; validar no APK/IPA.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + Infra  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M6-001

**Categoria OWASP:** M6 — Inadequate Privacy Controls  
**Severidade:** Alto  
**CWE:** CWE-359  
**Componente afetado:** Governança LGPD/GDPR  
**Causa raiz:** Não há política, finalidade, retenção, revogação, exportação ou
exclusão de conta/dados evidenciada no app/repositório.  
**Evidência (arquivo/linha):** PII definida em `src/types.ts:3-12,27-34`;
persistência em `src/api/storage.ts:9-22`; nenhuma implementação de consentimento ou
exclusão encontrada.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [x] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Coleta e retenção sem transparência aumentam exposição e risco
regulatório. LGPD: arts. 6º, 7º, 9º, 18 e 46.  
**Recomendação:** Inventário de dados, base legal/finalidade, aviso de privacidade,
retenção, direitos do titular, exclusão/exportação e controles técnicos.  
**Prazo sugerido:** Imediato  
**Responsável:** DPO/Jurídico + Produto + Engenharia  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M6-002

**Categoria OWASP:** M6 — Inadequate Privacy Controls  
**Severidade:** Médio  
**CWE:** CWE-359  
**Componente afetado:** Push notifications  
**Causa raiz:** Ao abrir detalhe da orientação, o app solicita permissão e registra
token push sem tela própria de finalidade/preferência/revogação.  
**Evidência (arquivo/linha):** `src/screens/SolicitacaoDetalheScreen.tsx:47`;
`src/hooks/usePushNotifications.ts:4-7`;
`src/services/pushNotificationService.ts:8-23`.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Token de dispositivo é tratado sem ciclo explícito de
consentimento e revogação. Privacy Risk Score: Médio.  
**Recomendação:** Explicar finalidade antes do prompt do SO, permitir opt-out,
revogar token no backend e minimizar conteúdo sensível em notificações.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Produto + Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M7-001

**Categoria OWASP:** M7 — Insufficient Binary Protections  
**Severidade:** Médio  
**CWE:** CWE-693  
**Componente afetado:** Build Android/iOS  
**Causa raiz:** Hardening não está explicitamente codificado/verificável: não há
configuração versionada de R8/ProGuard, stripping, anti-tampering, debug/root checks
ou política de source maps.  
**Evidência (arquivo/linha):** `app.json:1-35`; diretórios nativos são ignorados em
`.gitignore:52-54`. Hermes não está explicitamente configurado.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Um atacante extrai o APK/IPA e analisa bundle, endpoints,
contratos e lógica em horas/dias; altera cliente para ignorar controles de UI.  
**Recomendação:** Gerar builds release auditáveis, confirmar Hermes/minificação/R8,
remover símbolos/source maps públicos, avaliar Play Integrity/App Attest e nunca
depender de anti-root para autorização.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile + DevOps  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M8-001

**Categoria OWASP:** M8 — Security Misconfiguration  
**Severidade:** Médio  
**CWE:** CWE-16  
**Componente afetado:** Configuração Expo/nativa/OTA  
**Causa raiz:** Controles de release não estão explícitos: canal/runtimeVersion OTA,
política de updates, cleartext, backup e flags de produção não são versionados.  
**Evidência (arquivo/linha):** `app.json:15-33`; saída de
`npx expo config --type public --json` não contém política de updates/runtimeVersion.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Build gerado com defaults inadequados pode aceitar backup,
cleartext, debug ou update no canal errado.  
**Recomendação:** Codificar e revisar config plugins de segurança, canais assinados,
runtimeVersion, política OTA, backups e tráfego cleartext; inspecionar APK/IPA final.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Mobile + DevOps  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M8-002

**Categoria OWASP:** M8 — Security Misconfiguration  
**Severidade:** Médio  
**CWE:** CWE-209  
**Componente afetado:** Tratamento de erros  
**Causa raiz:** Mensagens textuais do backend e `Error.message` são exibidas
diretamente ao usuário.  
**Evidência (arquivo/linha):** `src/utils/validation.ts:3-15,29-30`; múltiplas telas
usam `Alert.alert(..., getErrorMessage(error))`.  
**Impacto (CIA):** C: [ ] Alto [x] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Backend mal configurado retorna stack trace, SQL, IDs internos
ou detalhes de infraestrutura, que são apresentados no app.  
**Recomendação:** Mapear códigos de erro para mensagens seguras; registrar detalhes
somente em telemetria sanitizada e restrita.  
**Prazo sugerido:** Curto prazo  
**Responsável:** Backend + Mobile  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M9-001

**Categoria OWASP:** M9 — Insecure Data Storage  
**Severidade:** Alto  
**CWE:** CWE-22 / CWE-922  
**Componente afetado:** Download/cache de anexos  
**Causa raiz:** Nome de arquivo remoto é concatenado ao cache sem sanitização; o
arquivo permanece após compartilhamento.  
**Evidência (arquivo/linha):** `src/services/anexoService.ts:22-37`.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [x] Alto [ ] Médio [ ] Baixo A: [ ] Alto [x] Médio [ ] Baixo  
**Vetor de ataque:** Nome como `../arquivo` tenta escapar do diretório esperado;
dispositivo comprometido recupera anexos residuais do cache.  
**Recomendação:** Gerar nome local aleatório, remover separadores, validar extensão,
usar diretório privado e apagar o arquivo em `finally` após o compartilhamento.  
**Prazo sugerido:** Imediato  
**Responsável:** Mobile + Backend  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

### ID: VULN-M9-002

**Categoria OWASP:** M9 — Insecure Data Storage  
**Severidade:** Médio  
**CWE:** CWE-200  
**Componente afetado:** Proteção visual de telas sensíveis  
**Causa raiz:** Não há bloqueio de screenshots/recents em telas com PII, mensagens e
anexos.  
**Evidência (arquivo/linha):** Ausência de `FLAG_SECURE`/screen capture protection em
`package.json`, `app.json` e telas protegidas.  
**Impacto (CIA):** C: [x] Alto [ ] Médio [ ] Baixo I: [ ] Alto [ ] Médio [x] Baixo A: [ ] Alto [ ] Médio [x] Baixo  
**Vetor de ataque:** Snapshot de recents, gravação de tela ou app malicioso captura
informações exibidas.  
**Recomendação:** Aplicar proteção em telas realmente sensíveis, ocultar conteúdo ao
ir para background e documentar exceções de UX/acessibilidade.  
**Prazo sugerido:** Médio prazo  
**Responsável:** Mobile + Produto  
**Status:** [x] Pendente [ ] Em andamento [ ] Corrigido [ ] Aceito

## M10 — RESULTADO CRIPTOGRÁFICO

Não foram encontrados MD5, SHA-1, DES, 3DES, RC4, ECB, `Math.random()` para
segurança, chaves hardcoded ou criptografia caseira no frontend. O app não implementa
criptografia própria; depende de TLS, JWT e controles do backend. A efetividade desses
controles não pôde ser auditada sem API/infraestrutura. O achado de comunicação HTTP
está registrado em **VULN-M5-001**, e o armazenamento sem proteção em
**VULN-M1-001/M1-002**.

## PLANO DE REMEDIAÇÃO

**Prioridade 1 — Imediato (Críticos):**

1. Migrar API/SignalR para HTTPS/WSS e bloquear cleartext.
2. Resolver `shell-quote` crítica e atualizar `axios`.
3. Migrar JWT para SecureStore/Keychain/Keystore.
4. Corrigir cache/validação de anexos.
5. Confirmar autorização e sessão no backend.

**Prioridade 2 — Curto prazo (Altos):**

1. Atualizar `@xmldom/xmldom`/árvore Expo de forma compatível.
2. Implementar pinning com rotação após estabilizar HTTPS.
3. Definir política LGPD, retenção, exclusão e consentimento.
4. Criar testes de contrato 401/403, upload e expiração/revogação.
5. Codificar configuração segura de release/OTA.

**Prioridade 3 — Médio prazo (Médios):**

1. Validar DTOs e parâmetros com Zod.
2. Melhorar política de senha e confirmar rate limiting/MFA.
3. Fixar dependências críticas, gerar SBOM e aplicar gates no CI.
4. Revisar hardening binário, screenshots e mensagens de erro.

**Re-auditoria agendada para:** após conclusão da Prioridade 1 ou antes do próximo release.

## APÊNDICE A — SUMÁRIO M2 SUPPLY CHAIN

**Score geral da supply chain:** Alto

| Pacote | Atual | Seguro/recomendado | Severidade/advisory | Ação |
|---|---:|---:|---|---|
| shell-quote | 1.8.3 | versão corrigida na árvore compatível | Crítica, GHSA-w7jw-789q-3m8p, CVSS 8.1 | Upgrade React Native/Expo/dependência transitiva |
| axios | 1.15.1 | 1.18.0, mínimo >=1.16.0 | Alta, múltiplos GHSAs, CVSS até 8.7 | Upgrade direto imediato |
| @xmldom/xmldom | 0.8.12 | >=0.8.13 | Alta, XML injection/DoS | Override validado ou upgrade Expo |
| Expo/tooling e transitivas | diversas | versão compatível corrigida | 16 moderadas | Planejar upgrade e gate CI |

- `package-lock.json` v3 existe, está rastreado e `npm ls --depth=0` não mostrou
  inconsistências.
- Somente `fsevents` aparece com install script no lockfile; não foram encontrados
  scripts root `postinstall`.
- A alegação “não mantido há mais de 12 meses” não foi confirmada por evidência
  suficiente; não foi registrada como vulnerabilidade.

## APÊNDICE B — FLUXO DE AUTENTICAÇÃO

### Atual

```text
LoginScreen -> POST /auth/login -> recebe Token + Usuario
  -> AsyncStorage grava Token + Usuario
  -> AuthContext considera signedIn = Boolean(token && usuario)
  -> interceptor injeta Bearer
  -> 401 limpa armazenamento local
  -> logout somente limpa armazenamento local
```

### Recomendado

```text
Login + rate limit/MFA -> access token curto + refresh token rotativo
  -> access token em memória/SecureStore; refresh token em SecureStore
  -> validar expiração/issuer/audience conforme contrato
  -> refresh rotativo e detecção de reutilização
  -> backend autoriza cada recurso/ação
  -> logout revoga sessão no servidor e limpa armazenamento
```

## APÊNDICE C — EXEMPLOS DE CORREÇÃO

### Armazenamento seguro

```ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "@ProjetoTCC:token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
```

### Validação de rota/DTO com Zod

```ts
import { z } from "zod";

const idSchema = z.coerce.number().int().positive();
const solicitacaoId = idSchema.parse(id);

const orientacaoSchema = z.object({
  SolicitacaoId: z.number().int().positive(),
  StatusId: z.number().int().min(1).max(5),
  Status: z.string().max(40),
});
```

### Download seguro

```ts
const safeName = `${crypto.randomUUID()}.bin`;
const target = `${FileSystem.cacheDirectory}${safeName}`;
try {
  // baixar, validar e compartilhar
} finally {
  await FileSystem.deleteAsync(target, { idempotent: true });
}
```

### Configuração de comunicação

```text
Produção:
EXPO_PUBLIC_API_URL=https://api.exemplo.com
SignalR: wss://api.exemplo.com/hubs/projetotcc
TLS: mínimo 1.2; preferir 1.3; sem cleartext.
Android: network security config bloqueando cleartext.
iOS: ATS sem NSAllowsArbitraryLoads.
Pinning: dois pins SPKI, rotação planejada e fallback controlado.
```

## APÊNDICE D — MAPEAMENTO DOS PROMPTS

| OWASP | Resultado principal |
|---|---|
| M1 | 2 achados; JSON em `security-audit/owasp-m1-findings.json` |
| M2 | 19 vulnerabilidades npm; supply chain Alto |
| M3 | Sessão e autorização dependem excessivamente do cliente/contrato não validado |
| M4 | Rotas, DTOs, links e uploads precisam validação adicional |
| M5 | HTTP atual é crítico; pinning ausente |
| M6 | Governança LGPD/consentimento/retenção não evidenciada |
| M7 | Hardening do binário final não está codificado/verificável |
| M8 | Configuração nativa/OTA e erros precisam hardening |
| M9 | AsyncStorage, cache de anexos e screenshots expõem dados |
| M10 | Nenhuma criptografia fraca própria encontrada; backend/TLS não auditáveis |
