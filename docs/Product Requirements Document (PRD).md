#pessoal #projeto #kanban 

**Produto:** TaskMaster - AI-First Desktop Kanban
**Versão:** 1.0 (Desktop Edition)
**Data:** 11 de Março de 2026
**Autor:** Arquiteto de Software & PM
**Status:** Aprovado para Desenvolvimento

---

## 1. Visão Geral do Produto
O **TaskMaster** é um aplicativo desktop local de gerenciamento de produtividade e projetos baseado em Kanban. Seu diferencial exclusivo (USP - Unique Selling Proposition) é a arquitetura **AI-First via MCP (Model Context Protocol)**. 

Ele permite que o usuário gerencie seu fluxo de trabalho de duas formas perfeitamente sincronizadas:
1. **Manualmente:** Através de uma interface gráfica rica, fluida e responsiva (Drag-and-Drop).
2. **Via Inteligência Artificial:** Permitindo que assistentes locais (como o Claude Desktop) leiam o contexto do banco de dados e executem ações automáticas (criar projetos, mover tarefas, gerar relatórios) via chat, refletindo as mudanças na UI em tempo real.

Por ser um app Desktop com banco de dados local (SQLite), ele garante **100% de privacidade dos dados** e **zero latência de rede**.

---

## 2. Objetivos e Métricas de Sucesso
*   **Privacidade e Performance:** Entregar uma experiência totalmente offline-first com tempo de resposta do banco de dados < 50ms.
*   **Sincronia UI/IA:** Garantir que qualquer alteração feita via MCP (IA) atualize a interface do usuário instantaneamente via gerenciamento de estado (Zustand) sem necessidade de *refresh*.
*   **Adoção de UI:** Reproduzir fielmente o layout de alta fidelidade aprovado (Dark Theme nativo, gráficos complexos, e modais detalhados).

---

## 3. Stack Tecnológica Definitiva
A engenharia do projeto será construída sobre as seguintes tecnologias:
*   **Container Desktop:** Electron (Node.js).
*   **Frontend (Renderer):** React.js.
*   **Estilização:** SCSS (Sass) para modularidade e manutenção do Dark Theme.
*   **Gerenciamento de Estado:** Zustand (para sincronização reativa entre o backend IPC e a tela).
*   **Validação de Dados:** Zod (garantindo que o Frontend, o Backend e a IA enviem dados corretos).
*   **Banco de Dados:** SQLite (local, arquivo `.sqlite` salvo na máquina do usuário).
*   **Integração de IA:** SDK oficial do `@modelcontextprotocol/sdk` rodando no Main Process do Electron.

---

## 4. Escopo e Funcionalidades (Epics)

### Epic 1: Infraestrutura e Workspace Local (Settings)
*   **[1.1] Banco de Dados Local:** Criação automática do arquivo SQLite na pasta de dados do usuário (ex: `%APPDATA%/TaskMaster`) na primeira inicialização.
*   **[1.2] Configurações Gerais:** Alternância de Idioma e Tema (Dark/Light mode) persistidos localmente.
*   **[1.3] Gerenciamento de Dados:** Funcionalidade de exportar todo o workspace para `.JSON` ou `.CSV` diretamente pela interface de *Settings*.
*   **[1.4] Colunas Dinâmicas de Workflow:** O usuário pode criar, renomear, reordenar e excluir as colunas padrão do Kanban (ex: *To Do, In Progress, Done, Review*) pela tela de configurações.

### Epic 2: Gestão de Projetos e Kanban (Board)
*   **[2.1] Criação de Projetos:** Interface para criar novos boards.
*   **[2.2] Visualização Kanban:** Renderização das colunas dinâmicas com contagem de tarefas por coluna (ex: `To Do (3)`).
*   **[2.3] Motor Drag-and-Drop:** Capacidade de arrastar *Cards* horizontalmente (entre colunas) e verticalmente (reordenação de prioridade), atualizando o SQLite via IPC instantaneamente.
*   **[2.4] Indicadores Visuais:** Cards devem exibir tags de Prioridade (High, Medium, Low), quantidade de comentários/anexos e avatares mockados ou locais.

### Epic 3: Motor de Tarefas (Task Flow)
*   **[3.1] Modal de Criação Enriquecida:** Formulário completo validado com **Zod** contendo: Título, Descrição, Projeto de destino, Prioridade (Dropdown) e Due Date (Datepicker).
*   **[3.2] Upload de Anexos Local:** Área de drag-and-drop no modal para anexar arquivos (SVG, PNG, JPG, PDF) limitados a 10MB. Os arquivos serão copiados para uma pasta local do TaskMaster e linkados no banco de dados.

### Epic 4: Servidor MCP e Assistente de IA
O Main Process do Electron rodará um servidor MCP que expõe *Tools* (ferramentas) e *Resources* (contextos) para LLMs locais ou externos:
*   **[4.1] Tool `create_project`:** Cria um novo board no SQLite.
*   **[4.2] Tool `create_task`:** Cria uma nova tarefa com base em um prompt (ex: *"Crie uma tarefa de alta prioridade para arrumar o footer"*).
*   **[4.3] Tool `move_task`:** Altera o `column_id` de uma tarefa específica.
*   **[4.4] Resource `board_state`:** Permite que a IA leia o estado atual do SQLite em tempo real para entender o contexto antes de tomar decisões.
*   **[4.5] Evento de Sincronização (IPC):** Sempre que a IA modificar o SQLite, o Main Process emite um evento IPC para o Zustand no React atualizar a tela na mesma hora.

### Epic 5: Dashboard e Analytics
*   **[5.1] Cards de Resumo:** Cálculo em tempo real de "Total Tasks", "In Progress", e "Completed".
*   **[5.2] Gráfico de Atividade:** Renderização de um gráfico de linha (via Recharts ou similar) mostrando "Completed Tasks per Day" (Filtros de 7 ou 30 dias).
*   **[5.3] Breakdown de Prioridade:** Barras de progresso mostrando o volume de tarefas separadas por urgência.
*   **[5.4] Activity Log (Trilha de Auditoria):** Uma lista de eventos recentes exibindo quem fez a ação (ex: *Task "API Integration" moved to Done - 2 hours ago*), diferenciando ações feitas manualmente pelo usuário das ações feitas via automação MCP.

---

## 5. Modelagem de Dados (High-Level SQLite Schema)
Todas as tabelas terão campos de controle de data.

1.  **`projects`**: `id` (PK), `name`, `created_at`.
2.  **`columns`**: `id` (PK), `project_id` (FK), `name`, `order_index`, `created_at`.
3.  **`tasks`**: `id` (PK), `project_id` (FK), `column_id` (FK), `title`, `description`, `priority` (Enum: low, medium, high), `due_date`, `created_at`, `updated_at`.
4.  **`attachments`**: `id` (PK), `task_id` (FK), `file_path` (local path), `file_type`, `created_at`.
5.  **`activity_logs`**: `id` (PK), `task_id` (FK), `action_type` (created, updated, moved), `actor` (user, ai_mcp), `created_at`.

---

## 6. Requisitos Não-Funcionais (NFRs)
1.  **Segurança IPC:** O React (Renderer) não terá acesso direto às APIs do Node.js. Toda comunicação com o SQLite e o MCP será feita através de uma `preload.js` bridge (ContextBridge) fortemente tipada e segura.
2.  **Performance de UI:** A renderização do Kanban deve suportar pelo menos 500 cards ativos simultaneamente sem queda de frames (60 FPS) durante a rolagem ou drag-and-drop.
3.  **Graceful Degradation:** Se o servidor MCP não for utilizado ou o usuário não tiver um client de IA configurado, o aplicativo deve funcionar perfeitamente em modo manual, sem emitir erros visíveis.

---

## 7. Próximos Passos (Fases de Desenvolvimento)
*   **Passo 1:** Configuração do boilerplate do Electron + React + SCSS.
*   **Passo 2:** Implementação do banco de dados SQLite e criação da ponte IPC (Inter-Process Communication).
*   **Passo 3:** Desenvolvimento da UI estática (Dashboard, Projetos, Modal de Criação) baseada nos layouts.
*   **Passo 4:** Integração do Zustand com Zod para gerenciar o estado do Kanban e formulários.
*   **Passo 5:** Implementação do Servidor MCP no Main Process do Electron.
*   **Passo 6:** Testes de ponta a ponta (Manual vs AI Agent).
