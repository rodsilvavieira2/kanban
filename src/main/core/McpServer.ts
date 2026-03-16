import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { GetProjectsUseCase } from "./useCases/project/GetProjectsUseCase";
import { GetProjectDataUseCase } from "./useCases/project/GetProjectDataUseCase";
import { CreateTaskUseCase } from "./useCases/task/CreateTaskUseCase";
import { UpdateTaskUseCase } from "./useCases/task/UpdateTaskUseCase";
import { MoveTaskUseCase } from "./useCases/task/MoveTaskUseCase";
import { UpdateTaskTimeUseCase } from "./useCases/task/UpdateTaskTimeUseCase";

export class McpServer {
  private server: Server;

  constructor(
    private getProjectsUseCase: GetProjectsUseCase,
    private getProjectDataUseCase: GetProjectDataUseCase,
    private createTaskUseCase: CreateTaskUseCase,
    private updateTaskUseCase: UpdateTaskUseCase,
    private moveTaskUseCase: MoveTaskUseCase,
    private updateTaskTimeUseCase: UpdateTaskTimeUseCase,
    private onDataUpdated: () => void,
  ) {
    this.server = new Server(
      {
        name: "taskmaster-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const projects = await this.getProjectsUseCase.execute();
      return {
        resources: projects.map((p) => ({
          uri: `kanban://projects/${p.id}/board`,
          name: `${p.name} Board State`,
          mimeType: "application/json",
          description: `Full state of the ${p.name} board including columns and tasks.`,
        })),
      };
    });

    // Read a specific resource
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = new URL(request.params.uri);
        const projectId = uri.pathname.split("/")[2];

        if (uri.protocol !== "kanban:" || !projectId) {
          throw new Error(`Invalid URI: ${request.params.uri}`);
        }

        const projectData = await this.getProjectDataUseCase.execute(projectId);

        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(projectData, null, 2),
            },
          ],
        };
      },
    );

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_task",
            description: "Create a new task in a project board",
            inputSchema: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                columnId: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                dueDate: { type: "string" },
              },
              required: ["projectId", "columnId", "title"],
            },
          },
          {
            name: "update_task",
            description: "Update an existing task in the Kanban board",
            inputSchema: {
              type: "object",
              properties: {
                taskId: {
                  type: "string",
                  description: "The ID of the task to update",
                },
                title: {
                  type: "string",
                  description: "The new title of the task",
                },
                description: {
                  type: "string",
                  description: "The new description of the task",
                },
                columnId: {
                  type: "string",
                  description: "The ID of the column this task belongs to",
                },
                dueDate: {
                  type: "string",
                  description: "The new due date of the task (YYYY-MM-DD)",
                },
              },
              required: ["taskId"],
            },
          },
          {
            name: "move_task",            description:
              "Move a task within a board (reorder or move between columns)",
            inputSchema: {
              type: "object",
              properties: {
                taskId: { type: "string" },
                sourceColumnId: { type: "string" },
                destinationColumnId: { type: "string" },
                sourceIndex: { type: "number" },
                destinationIndex: { type: "number" },
              },
              required: [
                "taskId",
                "sourceColumnId",
                "destinationColumnId",
                "sourceIndex",
                "destinationIndex",
              ],
            },
          },
          {
            name: "update_task_time",
            description: "Add minutes to the time spent on a specific task",
            inputSchema: {
              type: "object",
              properties: {
                taskId: { type: "string" },
                minutes: { type: "number" },
              },
              required: ["taskId", "minutes"],
            },
          },
        ],
      };
    });

    // Call a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "create_task": {
          const taskData = request.params.arguments as Record<string, unknown>;
          const task = await this.createTaskUseCase.execute(taskData as { title: string; description?: string; columnId: string; projectId: string; dueDate?: string });
          if (this.onDataUpdated) this.onDataUpdated();
          return {
            content: [
              { type: "text", text: `Task created successfully: ${task.id}` },
            ],
          };
        }
        case "update_task": {
          const { taskId, ...taskData } = request.params.arguments as Record<string, unknown>;
          const task = await this.updateTaskUseCase.execute(taskId as string, taskData);
          if (this.onDataUpdated) this.onDataUpdated();
          return {
            content: [
              { type: "text", text: `Task updated successfully: ${task.id}` },
            ],
          };
        }
        case "move_task": {
          const moveRequest = request.params.arguments as { taskId: string; sourceColumnId: string; destinationColumnId: string; sourceIndex: number; destinationIndex: number; };
          await this.moveTaskUseCase.execute(moveRequest);
          if (this.onDataUpdated) this.onDataUpdated();
          return {
            content: [{ type: "text", text: "Task moved successfully" }],
          };
        }
        case "update_task_time": {
          const { taskId, minutes } = request.params.arguments as Record<string, unknown>;
          await this.updateTaskTimeUseCase.execute(taskId as string, minutes as number);
          if (this.onDataUpdated) this.onDataUpdated();
          return {
            content: [
              {
                type: "text",
                text: `Successfully added ${minutes} minutes to task ${taskId}`,
              },
            ],
          };
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("MCP Server started on stdio");
  }
}
