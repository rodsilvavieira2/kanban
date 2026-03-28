import http from "node:http";
import {
  McpServer as McpSdkServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import { GetProjectsUseCase } from "./useCases/project/GetProjectsUseCase";
import { CreateProjectUseCase } from "./useCases/project/CreateProjectUseCase";
import { DeleteProjectUseCase } from "./useCases/project/DeleteProjectUseCase";
import { GetProjectDataUseCase } from "./useCases/project/GetProjectDataUseCase";
import { CreateColumnUseCase } from "./useCases/column/CreateColumnUseCase";
import { MoveColumnUseCase } from "./useCases/column/MoveColumnUseCase";
import { CreateTaskUseCase } from "./useCases/task/CreateTaskUseCase";
import { UpdateTaskUseCase } from "./useCases/task/UpdateTaskUseCase";
import { MoveTaskUseCase } from "./useCases/task/MoveTaskUseCase";
import { UpdateTaskTimeUseCase } from "./useCases/task/UpdateTaskTimeUseCase";
import { DeleteTaskUseCase } from "./useCases/kanban/DeleteTaskUseCase";
import { GetRecentActivityUseCase } from "./useCases/activity/GetRecentActivityUseCase";

export class McpServer {
  constructor(
    private getProjectsUseCase: GetProjectsUseCase,
    private createProjectUseCase: CreateProjectUseCase,
    private deleteProjectUseCase: DeleteProjectUseCase,
    private getProjectDataUseCase: GetProjectDataUseCase,
    private createColumnUseCase: CreateColumnUseCase,
    private moveColumnUseCase: MoveColumnUseCase,
    private createTaskUseCase: CreateTaskUseCase,
    private updateTaskUseCase: UpdateTaskUseCase,
    private moveTaskUseCase: MoveTaskUseCase,
    private updateTaskTimeUseCase: UpdateTaskTimeUseCase,
    private deleteTaskUseCase: DeleteTaskUseCase,
    private getRecentActivityUseCase: GetRecentActivityUseCase,
    private onDataUpdated: () => void,
  ) {}

  // Creates a fresh McpSdkServer instance per request — required in stateless mode
  // because the SDK does not support calling connect() more than once on a single instance.
  private createSdkServer(): McpSdkServer {
    const server = new McpSdkServer({
      name: "taskmaster-mcp",
      version: "1.0.0",
    });
    this.setupHandlers(server);
    return server;
  }

  private setupHandlers(server: McpSdkServer) {
    // ── Resources ──────────────────────────────────────────────────────────────

    const boardTemplate = new ResourceTemplate(
      "kanban://projects/{projectId}/board",
      {
        list: async () => {
          const projects = await this.getProjectsUseCase.execute();
          return {
            resources: projects.map((p) => ({
              uri: `kanban://projects/${p.id}/board`,
              name: `${p.name} Board State`,
              mimeType: "application/json",
              description: `Full state of the ${p.name} board including columns and tasks.`,
            })),
          };
        },
      },
    );

    server.registerResource(
      "board",
      boardTemplate,
      {
        mimeType: "application/json",
        description:
          "Full state of a project board including columns and tasks.",
      },
      async (uri) => {
        const projectId = uri.pathname.split("/")[1];

        if (uri.protocol !== "kanban:" || !projectId) {
          throw new Error(`Invalid URI: ${uri.toString()}`);
        }

        const projectData = await this.getProjectDataUseCase.execute(projectId);

        return {
          contents: [
            {
              uri: uri.toString(),
              mimeType: "application/json",
              text: JSON.stringify(projectData, null, 2),
            },
          ],
        };
      },
    );

    // ── Project tools ──────────────────────────────────────────────────────────

    server.registerTool(
      "get_projects",
      {
        title: "Get Projects",
        description:
          "List all projects. Call this first to obtain project and column IDs required by other tools.",
      },
      async () => {
        const projects = await this.getProjectsUseCase.execute();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      },
    );

    server.registerTool(
      "create_project",
      {
        title: "Create Project",
        description:
          "Create a new Kanban project board. Returns the created project including its generated ID.",
        inputSchema: {
          name: z.string().describe("The name of the project"),
          description: z
            .string()
            .optional()
            .describe("An optional description of the project"),
          status: z
            .enum(["Planning", "In Progress", "Completed"])
            .optional()
            .describe("Initial project status (defaults to Planning)"),
          dueDate: z
            .string()
            .optional()
            .describe("Optional due date for the project (YYYY-MM-DD)"),
        },
      },
      async ({ name, description, status, dueDate }) => {
        const project = await this.createProjectUseCase.execute({
          name,
          description,
          status,
          dueDate,
        });
        this.onDataUpdated();
        return {
          content: [
            {
              type: "text",
              text: `Project created successfully: ${JSON.stringify(project, null, 2)}`,
            },
          ],
        };
      },
    );

    server.registerTool(
      "delete_project",
      {
        title: "Delete Project",
        description:
          "Permanently delete a project and all its columns and tasks.",
        inputSchema: {
          projectId: z.string().describe("The ID of the project to delete"),
        },
      },
      async ({ projectId }) => {
        await this.deleteProjectUseCase.execute(projectId);
        this.onDataUpdated();
        return {
          content: [
            { type: "text", text: `Project ${projectId} deleted successfully` },
          ],
        };
      },
    );

    // ── Board tool ─────────────────────────────────────────────────────────────

    server.registerTool(
      "get_board",
      {
        title: "Get Board",
        description:
          "Get the full board state for a project: its columns (with IDs) and all tasks. " +
          "Use this after get_projects to obtain column IDs needed for create_task and move_task.",
        inputSchema: {
          projectId: z.string().describe("The ID of the project"),
        },
      },
      async ({ projectId }) => {
        const projectData = await this.getProjectDataUseCase.execute(projectId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projectData, null, 2),
            },
          ],
        };
      },
    );

    // ── Column tools ───────────────────────────────────────────────────────────

    server.registerTool(
      "create_column",
      {
        title: "Create Column",
        description: "Create a new column in a project.",
        inputSchema: {
          projectId: z.string().describe("The ID of the project"),
          title: z.string().describe("The title of the new column"),
        },
      },
      async ({ projectId, title }) => {
        const column = await this.createColumnUseCase.execute(projectId, title);
        this.onDataUpdated();
        return {
          content: [
            {
              type: "text",
              text: `Column created successfully: ${JSON.stringify(column, null, 2)}`,
            },
          ],
        };
      },
    );

    server.registerTool(
      "move_column",
      {
        title: "Move Column",
        description: "Reorder a column within a project. Use index 0 for the first column.",
        inputSchema: {
          projectId: z.string().describe("The ID of the project"),
          sourceIndex: z.number().int().min(0).describe("Current zero-based position of the column"),
          destinationIndex: z.number().int().min(0).describe("Target zero-based position for the column"),
        },
      },
      async (moveRequest) => {
        await this.moveColumnUseCase.execute(moveRequest);
        this.onDataUpdated();
        return {
          content: [{ type: "text", text: "Column moved successfully" }],
        };
      },
    );

    // ── Task tools ─────────────────────────────────────────────────────────────

    server.registerTool(
      "create_task",
      {
        title: "Create Task",
        description:
          "Create a new task in a project column. Use get_projects first to obtain valid projectId and columnId values.",
        inputSchema: {
          projectId: z.string().describe("The ID of the project"),
          columnId: z
            .string()
            .describe("The ID of the column to place the task in"),
          title: z.string().describe("The title of the task"),
          description: z
            .string()
            .optional()
            .describe(
              "An optional description of the task. Markdown syntax is supported and recommended — use **bold**, _italic_, `code`, bullet lists, headings, etc.",
            ),
          dueDate: z
            .string()
            .optional()
            .describe("Optional due date (YYYY-MM-DD)"),
          tags: z
            .array(z.string())
            .optional()
            .describe("Optional list of tag labels for the task"),
        },
      },
      async ({ projectId, columnId, title, description, dueDate, tags }) => {
        const task = await this.createTaskUseCase.execute({
          projectId,
          columnId,
          title,
          description,
          dueDate,
          tags,
        });
        this.onDataUpdated();
        return {
          content: [
            {
              type: "text",
              text: `Task created successfully: ${JSON.stringify(task, null, 2)}`,
            },
          ],
        };
      },
    );

    server.registerTool(
      "update_task",
      {
        title: "Update Task",
        description:
          "Update one or more fields of an existing task. Only supplied fields are changed.",
        inputSchema: {
          taskId: z.string().describe("The ID of the task to update"),
          title: z.string().optional().describe("New title for the task"),
          description: z
            .string()
            .optional()
            .describe(
              "New description for the task. Markdown syntax is supported and recommended — use **bold**, _italic_, `code`, bullet lists, headings, etc.",
            ),
          columnId: z
            .string()
            .optional()
            .describe("Move the task to a different column by its ID"),
          dueDate: z.string().optional().describe("New due date (YYYY-MM-DD)"),
          tags: z
            .array(z.string())
            .optional()
            .describe(
              "Replacement list of tag labels (overwrites existing tags)",
            ),
        },
      },
      async ({ taskId, ...taskData }) => {
        const task = await this.updateTaskUseCase.execute(taskId, taskData);
        this.onDataUpdated();
        return {
          content: [
            {
              type: "text",
              text: `Task updated successfully: ${JSON.stringify(task, null, 2)}`,
            },
          ],
        };
      },
    );

    server.registerTool(
      "move_task",
      {
        title: "Move Task",
        description:
          "Reorder a task within a column or move it to a different column, preserving position. " +
          "Use index 0 for the top of the column.",
        inputSchema: {
          taskId: z.string().describe("The ID of the task to move"),
          sourceColumnId: z
            .string()
            .describe("The ID of the column the task is currently in"),
          destinationColumnId: z
            .string()
            .describe(
              "The ID of the column to move the task to (same as sourceColumnId for reorder)",
            ),
          sourceIndex: z
            .number()
            .int()
            .min(0)
            .describe(
              "Current zero-based position of the task in the source column",
            ),
          destinationIndex: z
            .number()
            .int()
            .min(0)
            .describe("Target zero-based position in the destination column"),
        },
      },
      async (moveRequest) => {
        await this.moveTaskUseCase.execute(moveRequest);
        this.onDataUpdated();
        return {
          content: [{ type: "text", text: "Task moved successfully" }],
        };
      },
    );

    server.registerTool(
      "update_task_time",
      {
        title: "Update Task Time",
        description:
          "Add minutes to the time spent on a task. Use positive values only.",
        inputSchema: {
          taskId: z.string().describe("The ID of the task"),
          minutes: z
            .number()
            .positive()
            .describe("Number of minutes to add to the task's time spent"),
        },
      },
      async ({ taskId, minutes }) => {
        await this.updateTaskTimeUseCase.execute(taskId, minutes);
        this.onDataUpdated();
        return {
          content: [
            {
              type: "text",
              text: `Successfully added ${minutes} minutes to task ${taskId}`,
            },
          ],
        };
      },
    );

    server.registerTool(
      "delete_task",
      {
        title: "Delete Task",
        description: "Permanently delete a task by its ID.",
        inputSchema: {
          taskId: z.string().describe("The ID of the task to delete"),
        },
      },
      async ({ taskId }) => {
        await this.deleteTaskUseCase.execute(taskId);
        this.onDataUpdated();
        return {
          content: [
            { type: "text", text: `Task ${taskId} deleted successfully` },
          ],
        };
      },
    );

    // ── Activity tools ─────────────────────────────────────────────────────────

    server.registerTool(
      "get_recent_activity",
      {
        title: "Get Recent Activity",
        description:
          "Retrieve the most recent activity log entries across all projects. " +
          "Useful for understanding what changed recently before taking further actions.",
        inputSchema: {
          limit: z
            .number()
            .int()
            .min(1)
            .max(200)
            .optional()
            .describe(
              "Maximum number of entries to return (default: 50, max: 200)",
            ),
        },
      },
      async ({ limit }) => {
        const activity = await this.getRecentActivityUseCase.execute(
          limit ?? 50,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(activity, null, 2),
            },
          ],
        };
      },
    );
  }

  async start(port = 3282) {
    const httpServer = http.createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, DELETE, OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, mcp-session-id",
      );

      if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
      }

      if (req.url === "/mcp" && req.method === "POST") {
        // Stateless mode: a fresh server + transport per request.
        // The SDK forbids calling connect() twice on the same instance, so both
        // must be created anew for every incoming request (per official SDK example).
        const sdkServer = this.createSdkServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        try {
          await sdkServer.connect(transport);
          await transport.handleRequest(req, res);
          res.on("close", () => {
            transport.close();
            sdkServer.close();
          });
        } catch (error) {
          console.error("MCP request error:", error);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Internal server error" },
                id: null,
              }),
            );
          }
        }
      } else {
        res.writeHead(404).end("Not found");
      }
    });

    await new Promise<void>((resolve) =>
      httpServer.listen(port, "127.0.0.1", resolve),
    );

    console.log(`MCP Server started on http://127.0.0.1:${port}/mcp`);
  }
}
