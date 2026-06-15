# 📋 ProjetoTCC Frontend Constitution

Convenções, padrões e princípios não negociáveis para o desenvolvimento do frontend React-Native.

---

## Core Principles

### I. Typed-First Development

Todos os tipos são definidos em `src/types.ts` ANTES de implementar lógica. TypeScript em modo `strict: true` é obrigatório. Uma única source of truth para contratos Backend ↔ Frontend.

### II. Separation of Concerns

- `src/components/` = Presentational, SEM lógica de negócio
- `src/screens/` = Orquestradores (chamam services + components)
- `src/services/` = Business logic (requests, validações, transformações)
- `app/` = Apenas roteamento (Expo-Router file-based)

### III. Composição Over Inheritance

Reutilizar componentes pequenos (Card, Input, Button) para montar UIs complexas. Context API apenas para estado global crítico (Auth).

### IV. Error Handling First

Toda operação async DEVE ter try-catch. Usar `getErrorMessage()` para extrair erro do backend. Avisar usuário com `Alert.alert()`.

### V. No Breaking Changes to Core

`App.tsx`, `app.json`, `AuthContext.tsx`, `package.json` são INTOCÁVEIS. Versões não negociáveis.

---

## Stack & Versions (NON-NEGOTIABLE)

| Tecnologia   | Versão     | Razão                  |
| ------------ | ---------- | ---------------------- |
| React        | `19.1.0`   | Latest stable          |
| React-Native | `0.81.5`   | Latest expo-compatible |
| Expo         | `~54.0.33` | Cross-platform         |
| Expo-Router  | `~6.0.23`  | File-based routing     |
| TypeScript   | `~5.9.2`   | `strict: true`         |
| Axios        | `^1.15.1`  | API requests           |
| AsyncStorage | `^2.2.0`   | Persistent cache       |

**NUNCA instale**: Redux, styled-components, Material-UI, outras libs de routing.

---

## Estrutura de Pastas

```
src/
├── types.ts                  ← ✅ ÚNICA source of truth de tipos
├── api/
│   ├── client.ts            ← Axios com interceptors JWT
│   └── storage.ts           ← AsyncStorage wrapper
├── services/                ← Business logic (CRUD, validações)
├── screens/                 ← Telas (orquestradores)
├── components/              ← Componentes reutilizáveis
├── hooks/                   ← Custom hooks
├── contexts/                ← AuthContext (única context necessária)
├── utils/                   ← Helpers (validation, formatação)
└── styles/
    └── theme.ts             ← ✅ ÚNICA source of truth de estilos

app/                          ← Roteamento dinâmico (Expo-Router)
├── _layout.tsx              ← Layout global
├── [id]/[dinamico].tsx      ← Rotas dinâmicas
```

---

## Padrões de Código

### Naming Conventions

- **Types**: `UsuarioDto`, `LoginRequest`, `AuthResponse` (DTO suffix)
- **Services**: `authService`, `solicitacaoService` (Service suffix)
- **Hooks**: `useAuth()`, `useTarefas()` (use prefix)
- **Components**: `Button`, `Card` (PascalCase)
- **Funções**: `getErrorMessage()`, `isEmail()` (camelCase)
- **Variáveis boolean**: `isLoading`, `hasError` (is/has prefix)

### Imports (Obrigatório)

```tsx
// ✅ Named exports SEMPRE
import { Component } from "../components/Component";
import { authService } from "../services/authService";
import type { SolicitacaoDto } from "../types";

// ❌ NUNCA default exports ou star imports
```

### Services (Padrão)

```tsx
export const solicitacaoService = {
  async criar(request: CriarSolicitacaoRequest) {
    const { data } = await api.post<SolicitacaoDto>("/solicitacoes", request);
    return data; // Retornar dados direto, não resposta inteira
  },
};
```

### Componentes (Padrão)

```tsx
type CardProps = PropsWithChildren<ViewProps>;

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  /* styles here */
});
```

### Screens (Padrão)

```tsx
export function SolicitacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(load); // Atualizar quando foca na tela

  return <Screen>{/* conteúdo */}</Screen>;
}
```

---

## Tratamento de Erros

### Padrão: getErrorMessage()

```tsx
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "response" in error) {
    const data = (error as any).response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return String(data.message);
    if (data?.Message) return String(data.Message);
    if (data?.errors) return "Verifique os campos informados.";
  }
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação.";
}
```

### Uso Obrigatório

```tsx
async function handleSubmit() {
  try {
    setBusy(true);
    const result = await authService.login({ email, senha });
    await authContext.setSession(result);
    router.replace("/home");
  } catch (error) {
    // ✅ SEMPRE usar getErrorMessage
    Alert.alert("Erro ao fazer login", getErrorMessage(error));
  } finally {
    setBusy(false);
  }
}
```

### Em Services: Deixar propagar

```tsx
export const tarefaService = {
  async criar(solicitacaoId: number, request: CriarTarefaRequest) {
    const { data } = await api.post<TarefaDto>(/* ... */);
    return data;
    // ❌ NÃO tratar erro aqui, deixar screen tratar
  },
};
```

### Loading States

```tsx
const [loading, setLoading] = useState(true); // Initial load
const [busy, setBusy] = useState(false); // Form submission

if (loading) return <Loading />;

<Button
  loading={busy} // Mostra spinner + disabled
  disabled={!isValid}
  onPress={handleSubmit}
/>;
```

---

## Temas e Estilos

### theme.ts (ÚNICA SOURCE OF TRUTH)

```tsx
export const theme = {
  colors: {
    background: "#f6f1e7",
    surface: "#fffaf0",
    input: "#fffdf7",
    border: "#d7c7a1",
    text: "#241610",
    muted: "#6f6252",
    primary: "#7a1f2b",
    success: "#1f7a4d",
    warning: "#b7791f",
    danger: "#b42318",
    accent: "#c69214",
  },
  radius: { sm: 8, md: 8 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
};
```

### Uso

```tsx
// ✅ OBRIGATÓRIO usar theme
backgroundColor: theme.colors.surface;
padding: theme.spacing.md;

// ❌ NUNCA hardcode
backgroundColor: "#fff";
padding: 16;
```

---

## Governance

### Intocáveis (NÃO MEXER NUNCA)

- `App.tsx`
- `app.json`
- `index.ts`
- `AuthContext.tsx`
- `package.json` (versões não negociáveis)
- `tsconfig.json`

### Checklist Pré-Commit

- [ ] Imports são named (não default)
- [ ] Tipos em `src/types.ts`
- [ ] Componentes em `src/components/` (sem lógica)
- [ ] Lógica em `src/services/` + `src/screens/`
- [ ] Erros tratados com `getErrorMessage()`
- [ ] Loading states implementados
- [ ] Sem console.log em produção
- [ ] StyleSheet ao final
- [ ] Temas usam `theme.*`
- [ ] Testado Android + iOS

### Alterações à Constitution

- Requer discussão em equipe
- Documentar razão + data
- Avisar todos os devs

---

**Version**: 1.0.0 | **Criada**: 2026-06-14 | **Última atualização**: 2026-06-14 | **Status**: ATIVA
