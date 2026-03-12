#pessoal #projeto #kanban 

**Projeto:** TaskMaster - AI-First Desktop Kanban
**Versão:** 1.0
**Data:** 11 de Março de 2026

## 1. Introdução
Este documento descreve a arquitetura do **TaskMaster**, um aplicativo desktop local para gerenciamento de projetos (Kanban). O sistema é projetado para operar offline com banco de dados embutido e possui um servidor nativo **MCP (Model Context Protocol)** que permite que Agentes de IA locais (ex: Claude Desktop, scripts customizados) manipulem a aplicação em tempo real.

## 2. Visão Geral e Padrão Arquitetural
O aplicativo utiliza o padrão de **Processos Múltiplos Isolados** inerente ao Electron, dividindo a aplicação em três camadas principais baseadas em segurança e responsabilidade:
1.  **Main Process (Backend/Node.js):** Responsável pelo I/O do sistema operacional, comunicação com o SQLite e hospedagem do Servidor MCP.
2.  **Preload Script (Bridge):** Interface de segurança (`contextBridge`) que expõe métodos específicos do Node.js para o Frontend sem vazar o acesso total ao sistema.
3.  **Renderer Process (Frontend/React):** Camada de apresentação reativa, onde o Zustand gerencia o estado da UI e o Zod valida as interações do usuário.

## 3. Stack Tecnológica
*   **Core Desktop:** Electron (Node.js).
*   **Frontend UI:** React.js, SCSS (Estilização modular e Dark Theme nativo).
*   **Gerenciamento de Estado:** Zustand (Reatividade assíncrona orientada a eventos).
*   **Validação de Dados:** Zod (Validação de schemas no Frontend e Backend).
*   **Persistência de Dados:** SQLite (com biblioteca `better-sqlite3` para performance síncrona).
*   **Integração IA:** `@modelcontextprotocol/sdk` (Servidor MCP transportado via `stdio` ou SSE local).

## 4. Diagrama de Comunicação (Visão Lógica)

```text
+-----------------------------------------------------------------------------------+
|                                 NÓ DE USUÁRIO / MÁQUINA                           |
|                                                                                   |
|  +--------------------+         +----------------------------------------------+  |
|  | Agente de IA Local | <=====> |               Main Process (Node.js)         |  |
|  | (ex: Claude App)   |  stdio  |                                              |  |
|  +--------------------+   MCP   |  [ Servidor MCP ] <-----> [ Controladores ]  |  |
|                                 |                                |             |  |
|                                 |  [ File System (Anexos) ]      v             |  |
|                                 |                       [ Bando de Dados ]     |  |
|                                 |                           (SQLite)           |  |
|                                 +----------------------------------------------+  |
|                                              ^  ( IPC / Eventos / RPC )           |
|                                              v                                    |
|                                 +----------------------------------------------+  |
|                                 |               Preload (ContextBridge)        |  |
|                                 |   - window.api.createTask(zodPayload)        |  |
|                                 |   - window.api.onDbUpdate(callback)          |  |
|                                 +----------------------------------------------+  |
|                                              ^                                    |
|                                              v                                    |
|                                 +----------------------------------------------+  |
|                                 |             Renderer Process (React)         |  |
|  +--------------------+         |                                              |  |
|  |  Humano / UI       | <=====> |  [ Zustand Store ] <-----> [ Validação Zod ] |  |
|  | (Mouse/Teclado)    | DOM/CSS |          |                        |          |  |
|  +--------------------+         |[ SCSS Styles ]      [ Componentes UI ]   |  |
|                                 +----------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

## 5. Estratégia de Estado e Validação (Zustand + Zod)
Para garantir que a UI sempre reflita o estado do banco de dados (mesmo quando alterado pela IA), utilizaremos a seguinte estratégia:
1.  **Zod Schemas Compartilhados:** Criaremos arquivos `.ts` contendo as regras de validação (ex: `TaskSchema`). O React usa esse schema para validar o formulário antes de enviar pelo IPC. O Node.js usa o mesmo schema para validar a requisição vinda do MCP antes de salvar no SQLite.
2.  **Zustand como "Espelho":** A Store do Zustand não muta os dados diretamente. Quando o usuário move um card, o React avisa o Main Process via IPC. O SQLite é atualizado. O Main Process dispara um evento global de volta (Broadcast `db-updated`). O Zustand escuta esse evento, busca a nova versão do banco (Read-only) e atualiza a interface.

## 6. Modelo de Dados (Schema Relacional SQLite)
A persistência será baseada em um modelo relacional leve e performático.

*   **`projects`**
    *   `id` (TEXT/UUID) - PK
    *   `name` (TEXT)
    *   `description` (TEXT)
    *   `created_at` (DATETIME)
*   **`columns`** (Permite o Kanban dinâmico da tela de Settings)
    *   `id` (TEXT/UUID) - PK
    *   `project_id` (TEXT) - FK para `projects.id`
    *   `name` (TEXT) - ex: "To Do", "In Progress"
    *   `order_index` (INTEGER) - Posição visual da coluna
*   **`tasks`**
    *   `id` (TEXT/UUID) - PK
    *   `project_id` (TEXT) - FK para `projects.id`
    *   `column_id` (TEXT) - FK para `columns.id`
    *   `title` (TEXT)
    *   `description` (TEXT)
    *   `priority` (TEXT) - 'low', 'medium', 'high'
    *   `due_date` (DATETIME)
    *   `created_at` (DATETIME)
    *   `updated_at` (DATETIME)
*   **`activity_logs`** (Trilha de auditoria para o Dashboard)
    *   `id` (TEXT/UUID) - PK
    *   `task_id` (TEXT) - FK para `tasks.id`
    *   `action` (TEXT) - 'created', 'moved', 'updated', 'deleted'
    *   `actor_type` (TEXT) - 'user' ou 'ai_mcp'
    *   `created_at` (DATETIME)

## 7. Arquitetura do Servidor MCP (IA Integration)
O Servidor MCP será instanciado no **Main Process** na inicialização do Electron.

*   **Transporte:** `StdioServerTransport` (Para integração direta com clientes de IA locais que iniciam o app) ou configuração de porta local caso atue como daemon.
*   **Recursos Expostos (Resources):**
    *   `kanban://{project_id}/state`: Retorna um JSON representando o estado atual do quadro (todas as colunas e tarefas ativas). Isso permite à IA "olhar" o quadro antes de tomar decisões.
*   **Ferramentas Expostas (Tools):**
    *   `create_task`: Invoca o controlador do SQLite para criar uma task. *Parâmetros Zod: title, description, priority, project_id, column_id.*
    *   `move_task`: Move uma task para outra coluna. *Parâmetros Zod: task_id, new_column_id.*
    *   `get_analytics`: Lê as agregações do SQLite para fornecer dados (ex: taxa de conclusão) para a IA gerar relatórios.

## 8. Fluxos Críticos do Sistema (Sequências)

### Cenário A: Usuário Humano movimenta um Card (Drag & Drop)
1.  Usuário arrasta a tarefa na UI (React).
2.  O Componente dispara `window.api.moveTask(taskId, newColumnId)`.
3.  O Main Process (Node) recebe o IPC, atualiza o campo `column_id` na tabela `tasks` no SQLite.
4.  O Main Process insere um log na tabela `activity_logs` com `actor_type: 'user'`.
5.  O Main Process emite um IPC `window.webContents.send('kanban-updated')`.
6.  Zustand escuta o evento, recarrega a query do SQLite via IPC, e a UI se alinha.

### Cenário B: Agente de IA cria uma Tarefa
1.  Usuário digita no chat da IA: *"Crie uma tarefa urgente para revisar a API"*.
2.  Cliente IA envia instrução via protocolo MCP (JSON-RPC) para o Main Process.
3.  Main Process valida os argumentos com o **Zod Schema**.
4.  Main Process insere na tabela `tasks` no SQLite.
5.  Main Process insere log na `activity_logs` com `actor_type: 'ai_mcp'`.
6.  Main Process emite um IPC `window.webContents.send('kanban-updated')`.
7.  A tarefa "aparece magicamente" na tela do usuário instantaneamente (Zustand atualiza a view).

## 9. Diretrizes de Qualidade e Segurança (ADRs - Architecture Decision Records)
*   **Isolamento Node/Browser (ADR 01):** O `nodeIntegration` no Electron será definido como `false`. O `contextIsolation` será `true`. Toda comunicação será feita estritamente via ContextBridge (Preload).
*   **Concorrência Local (ADR 02):** Como usamos SQLite (que tem restrições em múltiplas gravações paralelas massivas) no contexto de *single-user desktop*, o banco de dados rodará na mesma thread do Node (via `better-sqlite3`), garantindo gravações atômicas síncronas rápidas sem bloquear a UI.
*   **Estilização e Performance (ADR 03):** Optou-se por SCSS ao invés de CSS-in-JS pesado para garantir que a renderização inicial no Electron seja quase instantânea, mantendo o controle cirúrgico do Dark Mode nativo.

---
