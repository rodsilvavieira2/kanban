
**Projeto:** TaskMaster - AI-First Desktop Kanban
**Stack:** Electron, React, SCSS, Zustand, Zod, SQLite, MCP SDK
**Data:** 11 de Março de 2026

## 1. Estrutura de Diretórios (Monorepo Físico)
O projeto utilizará uma estrutura modular separando claramente os ambientes do Electron (Node.js) e do React (Browser), com uma pasta compartilhada para os esquemas de validação do Zod.

```text
taskmaster-app/
├── package.json
├── electron-builder.yml       # Configuração de build (Windows, Mac, Linux)
├── tsconfig.json
├── src/
│   ├── main/                  # [ PROCESSO PRINCIPAL - NODE.JS ]
│   │   ├── index.ts           # Ponto de entrada do Electron
│   │   ├── mcp/               # Lógica do Servidor de IA
│   │   │   ├── server.ts      # Inicialização do @modelcontextprotocol/sdk
│   │   │   ├── tools.ts       # Definição das ferramentas (create_task, etc)
│   │   │   └── resources.ts   # Definição de recursos (board_state)
│   │   ├── database/          # Lógica do SQLite (better-sqlite3)
│   │   │   ├── connection.ts  # Instância do DB e criação do arquivo local
│   │   │   ├── schema.sql     # DDL de criação das tabelas
│   │   │   └── controllers/   # Operações CRUD (projects, tasks, columns)
│   │   └── ipc/               # Handlers de comunicação com o Frontend
│   │       └── handlers.ts    # ipcMain.handle(...)
│   │
│   ├── preload/               # [ PONTE DE SEGURANÇA ]
│   │   └── index.ts           # contextBridge.exposeInMainWorld(...)
│   │
│   ├── renderer/              #[ FRONTEND - REACT ]
│   │   ├── index.tsx          # Ponto de entrada do React
│   │   ├── App.tsx            # Roteamento e layout base
│   │   ├── assets/            # Imagens, ícones locais
│   │   ├── styles/            # SCSS Global e variáveis (Dark Theme)
│   │   ├── components/        # Componentes UI reutilizáveis (Botões, Modais)
│   │   ├── features/          # Componentes de domínio
│   │   │   ├── board/         # Kanban, Drag-and-drop logic
│   │   │   ├── dashboard/     # Gráficos de Analytics
│   │   │   └── settings/      # Configurações de colunas dinâmicas
│   │   └── store/             # Gerenciamento de Estado
│   │       └── useKanbanStore.ts # Zustand Store
│   │
│   └── shared/                # [ CÓDIGO COMPARTILHADO ]
│       ├── types/             # Interfaces TypeScript (.d.ts)
│       └── schemas/           # Validações Zod (usadas no Main e Renderer)
│           ├── task.schema.ts
│           └── project.schema.ts
```

---

## 2. Modelagem Física de Dados (SQLite Schema)
O arquivo `src/main/database/schema.sql` será executado na primeira inicialização do app para criar as tabelas no arquivo `data.sqlite` do usuário.

```sql
-- Habilitar Foreign Keys no SQLite
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'en-US',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'created', 'moved', 'updated'
    actor TEXT NOT NULL,       -- 'user', 'ai_mcp'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```



