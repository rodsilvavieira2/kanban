# Software Requirements Specification (SRS)

**Produto:** TaskMaster - AI-First Desktop Kanban
**Versão:** 1.0 (Desktop Edition)
**Data:** 11 de Março de 2026

---

## 1. Introdução

### 1.1 Propósito
Este documento especifica os requisitos de software para o **TaskMaster**, detalhando as funcionalidades, interfaces, restrições e atributos de qualidade. Este documento servirá como base para o desenvolvimento, testes e validação da aplicação.

### 1.2 Escopo do Produto
O **TaskMaster** é um aplicativo desktop local de gerenciamento de produtividade e projetos baseado na metodologia Kanban. O diferencial do produto é a sua arquitetura **AI-First via MCP (Model Context Protocol)**. O software permite gerenciamento de tarefas de duas formas sincronizadas:
1. **Manualmente:** Por meio de uma interface gráfica Drag-and-Drop responsiva.
2. **Via IA:** Através de assistentes locais (como o Claude Desktop) que podem ler o banco de dados e executar ações automatizadas.
O aplicativo garante 100% de privacidade de dados operando offline com um banco de dados SQLite local.

### 1.3 Definições e Acrônimos
* **MCP:** Model Context Protocol.
* **IPC:** Inter-Process Communication (Comunicação entre processos no Electron).
* **Zustand:** Biblioteca de gerenciamento de estado para o React.
* **Zod:** Biblioteca de validação de esquemas (schemas) baseada em TypeScript.
* **TAD:** Documento de Arquitetura Técnica.
* **PRD:** Product Requirements Document.
* **SAD:** Software Architecture Document.

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto
O TaskMaster segue uma arquitetura baseada em **Processos Múltiplos Isolados** do Electron:
* **Main Process (Node.js):** Gerencia o SO, SQLite e Servidor MCP.
* **Preload Script (Bridge):** Interface de segurança (ContextBridge) para comunicação segura.
* **Renderer Process (React):** UI reativa com estado gerenciado pelo Zustand.

### 2.2 Funções do Produto
* Gerenciamento de painéis Kanban (Criação de projetos, colunas e tarefas).
* Motor de arrastar e soltar (Drag-and-Drop) para movimentação e priorização de tarefas.
* Servidor MCP integrado para comunicação bidirecional com assistentes de IA.
* Dashboards analíticos em tempo real.
* Configurações locais (Tema, Idioma, Exportação de Dados).

### 2.3 Ambiente Operacional
* **Sistema Operacional:** Aplicativo Desktop multi-plataforma (Windows, macOS, Linux) via Electron.
* **Banco de Dados:** SQLite embutido no sistema de arquivos do usuário (ex: `%APPDATA%/TaskMaster`).

### 2.4 Restrições de Design e Implementação
* O aplicativo deve ser implementado no monorepo especificado, com separação estrita de `main`, `preload`, `renderer` e `shared`.
* Nenhuma comunicação direta do Frontend (React) com o Node.js. Toda comunicação DEVE passar pela ponte IPC (Preload).
* O design de interface obrigatoriamente utilizará SCSS modular com suporte nativo ao Dark Theme (nada de CSS-in-JS pesado).

---

## 3. Requisitos Funcionais (System Features)

### 3.1 Epic 1: Infraestrutura e Workspace Local
* **REQ-1.1:** O sistema deve criar automaticamente um arquivo SQLite na primeira inicialização na pasta de dados local.
* **REQ-1.2:** O sistema deve permitir alternar idioma (ex: en-US) e tema (Dark/Light) com persistência local.
* **REQ-1.3:** O sistema deve permitir a exportação de todo o workspace para os formatos `.JSON` e `.CSV`.
* **REQ-1.4:** O sistema deve permitir gerenciar as colunas dinâmicas padrão (criar, renomear, reordenar, excluir).

### 3.2 Epic 2: Gestão de Projetos e Kanban
* **REQ-2.1:** O usuário deve ser capaz de criar novos quadros/projetos.
* **REQ-2.2:** A UI deve exibir colunas dinâmicas contendo a contagem de tarefas (ex: `To Do (3)`).
* **REQ-2.3:** O sistema deve possuir um motor Drag-and-Drop para movimentação de cards entre colunas (horizontal) e reordenação (vertical), atualizando o SQLite via IPC instantaneamente.
* **REQ-2.4:** Os cards de tarefas devem renderizar indicadores visuais para: Prioridade (High, Medium, Low), quantidade de anexos/comentários e avatares.

### 3.3 Epic 3: Motor de Tarefas (Task Flow)
* **REQ-3.1:** O sistema deve ter um modal enriquecido para criação de tarefas contendo Título, Descrição, Projeto, Prioridade (dropdown) e Due Date. Os dados devem ser validados via Zod.
* **REQ-3.2:** O sistema deve permitir upload de anexos via Drag-and-Drop (SVG, PNG, JPG, PDF) com limite de 10MB. Os arquivos devem ser salvos em diretório local e referenciados no banco.

### 3.4 Epic 4: Servidor MCP e Assistente de IA
* **REQ-4.1:** O Main Process deve expor a Tool MCP `create_project` para inserção no banco.
* **REQ-4.2:** O Main Process deve expor a Tool MCP `create_task` recebendo dados parametrizados pelo prompt da IA.
* **REQ-4.3:** O Main Process deve expor a Tool MCP `move_task` para alteração de colunas.
* **REQ-4.4:** O Servidor MCP deve expor o Resource `board_state`, retornando JSON do estado atual do quadro.
* **REQ-4.5:** Qualquer mutação originada pelo Servidor MCP deve disparar um evento IPC global (`db-updated` / `kanban-updated`) para atualizar a UI em tempo real via Zustand.

### 3.5 Epic 5: Dashboard e Analytics
* **REQ-5.1:** A tela de dashboard deve apresentar cartões de resumo ("Total Tasks", "In Progress", "Completed").
* **REQ-5.2:** O sistema deve exibir um gráfico de linha mostrando tarefas concluídas por dia (filtros 7 e 30 dias).
* **REQ-5.3:** O sistema deve mostrar barras de progresso contendo o volume de tarefas por prioridade.
* **REQ-5.4:** O sistema deve listar um histórico/trilha de auditoria (Activity Log) que diferencia ações do usuário de ações automatizadas pela IA (`ai_mcp`).

---

## 4. Requisitos de Interfaces Externas

### 4.1 Interface de Usuário (UI)
* A aplicação React deve replicar o layout de alta fidelidade aprovado com forte foco no Dark Theme.
* A renderização deve garantir que transições e drag-and-drop rodem a fluidos 60 FPS.

### 4.2 Interfaces de Software e Comunicação (IPC)
* **Preload Bridge:** `window.api.createTask`, `window.api.moveTask`, `window.api.onDbUpdate(callback)`, entre outros métodos fortemente tipados.
* O Backend Node.js atuará em concorrência local rodando SQLite na mesma thread usando `better-sqlite3` para garantir sincronia atômica rápida.

### 4.3 Interface de IA (MCP)
* Comunicação implementada usando `@modelcontextprotocol/sdk`. O transporte deve suportar `stdio` para clientes de IA que subam o processo da aplicação como ferramenta externa.

---

## 5. Requisitos Não-Funcionais (NFRs)

### 5.1 Performance e Resposta
* **NFR-1:** O tempo de resposta para operações locais no banco de dados deve ser inferior a 50ms.
* **NFR-2:** O motor Kanban na UI deve suportar a renderização de até 500 cards ativos de forma simultânea sem engasgos visuais durante a rolagem e arrasto (alvo de 60 FPS).

### 5.2 Segurança e Privacidade
* **NFR-3:** 100% Offline-First e Local. Nenhum dado do usuário deve ser enviado para servidores externos da aplicação.
* **NFR-4 (ADR 01):** Isolamento total Node/Browser. O Electron deve operar com `nodeIntegration: false` e `contextIsolation: true`.

### 5.3 Resiliência e Disponibilidade (Graceful Degradation)
* **NFR-5:** A aplicação deverá funcionar de modo totalmente autônomo. O uso da IA é complementar; caso não haja cliente MCP acoplado, o usuário deve poder realizar todas as ações graficamente sem observar erros.

---

## 6. Modelo Lógico de Dados (SQLite)
A aplicação garantirá as propriedades ACID por padrão no uso do SQLite:
* `workspaces` (id, theme, language, created_at)
* `projects` (id, name, description, created_at)
* `columns` (id, project_id, name, order_index)
* `tasks` (id, project_id, column_id, title, priority, due_date, etc)
* `activity_logs` (id, task_id, action_type, actor, created_at)
* `attachments` (id, task_id, file_path, file_type, created_at)
