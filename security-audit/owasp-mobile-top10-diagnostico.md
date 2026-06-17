# RELATORIO DE DIAGNOSTICO DE SEGURANCA - REACT NATIVE

Aplicacao: ProjetoTCC  
Versao: 1.0.0  
Data: 16/06/2026  
Auditor: Codex  
Escopo: OWASP Mobile Top 10 v2024

Documento-base: `C:\Users\usuario\Downloads\owasp_mobile_top10_react_native_136-639165406037550953.pdf`

------------------------------------------------------------
## SUMARIO EXECUTIVO
------------------------------------------------------------

Critico: 1  
Alto: 4  
Medio: 0  
Baixo: 0  
Total: 5  

Score geral de risco: [ ] Critico  [x] Alto  [ ] Medio  [ ] Baixo

Resumo:
Foram aplicados os prompts de auditoria OWASP Mobile Top 10 do documento-base. Foram priorizados e corrigidos 5 problemas relacionados a armazenamento inseguro, comunicacao insegura, validacao de entrada, autenticacao e supply chain. O `npm audit` inicial apontava 28 vulnerabilidades. Apos as correcoes de dependencias diretas/transitivas, restaram 26 vulnerabilidades residuais, majoritariamente ligadas ao stack Expo/React Native e dependentes de upgrade maior.

------------------------------------------------------------
## ACHADOS
------------------------------------------------------------

ID: VULN-M9-001  
Categoria OWASP: M9 - Armazenamento de Dados Inseguro / M1 - Uso Improprio de Credenciais  
Severidade: Critico  
CWE: CWE-922  
Componente afetado: `authStorage`

Causa raiz:
O app persistia JWT e dados de usuario em AsyncStorage. Esse armazenamento nao fornece protecao criptografica para dados sensiveis em dispositivo comprometido, backup exposto, root ou jailbreak.

Evidencia (arquivo/linha):
[src/api/storage.ts](../src/api/storage.ts) agora usa `memoryToken` e `memoryUser` em memoria e remove chaves legadas `@ProjetoTCC:token` e `@ProjetoTCC:usuario`.

Impacto (CIA): C: [x] Alto [ ] Medio [ ] Baixo  
              I: [ ] Alto [x] Medio [ ] Baixo  
              A: [ ] Alto [ ] Medio [x] Baixo

Vetor de ataque:
Atacante com acesso fisico ou sistema comprometido extrai o conteudo do AsyncStorage e reutiliza o JWT para acessar dados da conta.

Recomendacao:
Manter token e PII fora do AsyncStorage. Caso seja necessario persistir sessao, usar Keychain/Keystore via Expo SecureStore ou react-native-keychain, com expiracao e revogacao no backend.

Prazo sugerido: Imediato  
Responsavel: Equipe Frontend  
Status: [ ] Pendente  [ ] Em andamento  [x] Corrigido  [ ] Aceito

------------------------------------------------------------

ID: VULN-M5-001  
Categoria OWASP: M5 - Comunicacao de Rede Insegura  
Severidade: Alto  
CWE: CWE-319  
Componente afetado: `api` e `realtimeService`

Causa raiz:
`EXPO_PUBLIC_API_URL` aceitava endpoint HTTP em qualquer ambiente. Isso permite trafego claro em builds de producao se a variavel for configurada incorretamente.

Evidencia (arquivo/linha):
[src/api/client.ts](../src/api/client.ts) valida HTTPS em producao.  
[src/services/realtimeService.ts](../src/services/realtimeService.ts) exige HTTPS/WSS em producao.

Impacto (CIA): C: [x] Alto [ ] Medio [ ] Baixo  
              I: [x] Alto [ ] Medio [ ] Baixo  
              A: [ ] Alto [x] Medio [ ] Baixo

Vetor de ataque:
Atacante na mesma rede Wi-Fi intercepta login, mensagens, anexos e headers de autorizacao quando a API usa HTTP claro.

Recomendacao:
Usar HTTPS/WSS em producao, configurar HSTS no backend, revisar CORS por ambiente e avaliar certificate pinning nos builds nativos.

Prazo sugerido: Imediato  
Responsavel: Equipe Frontend/Backend  
Status: [ ] Pendente  [ ] Em andamento  [x] Corrigido  [ ] Aceito

------------------------------------------------------------

ID: VULN-M4-001  
Categoria OWASP: M4 - Validacao de Entrada Insuficiente  
Severidade: Alto  
CWE: CWE-20 / CWE-73  
Componente afetado: Upload e download de anexos

Causa raiz:
Arquivos selecionados pelo usuario eram validados apenas por tamanho na tela. Nome, extensao e MIME type nao eram validados de forma central, e o nome era usado sem sanitizacao no upload/download.

Evidencia (arquivo/linha):
[src/utils/validation.ts](../src/utils/validation.ts) adiciona `validateSelectedFile` e `sanitizeFileName`.  
[src/services/anexoService.ts](../src/services/anexoService.ts) aplica validacao e sanitizacao antes de upload/download.  
[src/screens/SolicitacaoDetalheScreen.tsx](../src/screens/SolicitacaoDetalheScreen.tsx) valida o arquivo selecionado antes de enviar.

Impacto (CIA): C: [ ] Alto [x] Medio [ ] Baixo  
              I: [x] Alto [ ] Medio [ ] Baixo  
              A: [ ] Alto [x] Medio [ ] Baixo

Vetor de ataque:
Arquivo com nome contendo traversal, CRLF ou extensao inesperada pode poluir multipart, cache local ou fluxo de abertura/compartilhamento.

Recomendacao:
Manter allowlist de extensoes e MIME types, sanitizar nomes, validar novamente no backend e escanear anexos antes de disponibilizar download.

Prazo sugerido: Curto prazo  
Responsavel: Equipe Frontend/Backend  
Status: [ ] Pendente  [ ] Em andamento  [x] Corrigido  [ ] Aceito

------------------------------------------------------------

ID: VULN-M3-001  
Categoria OWASP: M3 - Autenticacao e Autorizacao Inseguras  
Severidade: Alto  
CWE: CWE-521  
Componente afetado: Cadastro de usuario

Causa raiz:
O cadastro aceitava senha com apenas 6 caracteres e sem exigencia de complexidade minima.

Evidencia (arquivo/linha):
[src/screens/CadastroScreen.tsx](../src/screens/CadastroScreen.tsx) passou a usar `validatePassword`.  
[src/utils/validation.ts](../src/utils/validation.ts) exige pelo menos 8 caracteres, letra minuscula, letra maiuscula, numero e caractere especial.

Impacto (CIA): C: [x] Alto [ ] Medio [ ] Baixo  
              I: [x] Alto [ ] Medio [ ] Baixo  
              A: [ ] Alto [ ] Medio [x] Baixo

Vetor de ataque:
Senha fraca facilita brute force, password spraying ou credential stuffing, especialmente se combinada com ausencia de rate limiting no backend.

Recomendacao:
Manter validacao no cliente, impor a mesma regra no backend, adicionar rate limiting e bloqueio progressivo para tentativas falhas.

Prazo sugerido: Curto prazo  
Responsavel: Equipe Frontend/Backend  
Status: [ ] Pendente  [ ] Em andamento  [x] Corrigido  [ ] Aceito

------------------------------------------------------------

ID: VULN-M2-001  
Categoria OWASP: M2 - Supply Chain Insegura  
Severidade: Alto  
CWE: CWE-1321 / CWE-93  
Componente afetado: Dependencias npm

Causa raiz:
`npm audit` apontava `axios@1.15.1` com advisories de prototype pollution/request hijacking e `form-data<4.0.6` com CRLF injection.

Evidencia (arquivo/linha):
[package.json](../package.json) atualiza `axios` para `^1.18.0` e fixa `form-data` em `^4.0.6`.  
[package-lock.json](../package-lock.json) registra as resolucoes.

Impacto (CIA): C: [x] Alto [ ] Medio [ ] Baixo  
              I: [x] Alto [ ] Medio [ ] Baixo  
              A: [ ] Alto [x] Medio [ ] Baixo

Vetor de ataque:
Exploracao de gadgets de prototype pollution ou injecao em multipart poderia causar vazamento de credenciais, manipulacao de requests ou degradacao de disponibilidade.

Recomendacao:
Manter `npm audit` no gate de release, revisar dependencias diretas regularmente e planejar upgrade controlado de Expo/React Native para reduzir vulnerabilidades transitivas.

Prazo sugerido: Curto prazo  
Responsavel: Equipe Frontend  
Status: [ ] Pendente  [ ] Em andamento  [x] Corrigido  [ ] Aceito

------------------------------------------------------------
## PLANO DE REMEDIACAO
------------------------------------------------------------

Prioridade 1 - Imediato (Criticos):
Manter JWT e PII fora de AsyncStorage. Avaliar `shell-quote` critico transiente remanescente no `npm audit`; a correcao indicada passa por upgrades maiores de Expo/React Native e deve ser planejada para evitar quebra do stack.

Prioridade 2 - Curto prazo (Altos):
Garantir HTTPS/WSS em producao, manter validacao de anexos tambem no backend, aplicar politica forte de senha server-side, manter `axios` e `form-data` atualizados, e revisar `ws`, `@xmldom/xmldom`, `expo-*`, `react-native` e `postcss`.

Prioridade 3 - Medio prazo (Medios):
Adicionar SecureStore/Keychain se sessao persistente for requisito, implementar certificate pinning nos builds nativos, configurar FLAG_SECURE em telas sensiveis e fortalecer hardening binario com Hermes/R8/ProGuard.

Re-auditoria agendada para:
Apos upgrade do stack Expo/React Native e antes do release mobile nativo.

------------------------------------------------------------
## VALIDACOES EXECUTADAS
------------------------------------------------------------

- `npm audit --json`: executado antes e depois das correcoes.
- `npx tsc --noEmit`: aprovado.
- `npm run test:e2e`: aprovado com 7 testes em mobile Chromium.
