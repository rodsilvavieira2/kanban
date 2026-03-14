import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Planning', 'In Progress', 'Completed']),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  tasksCount: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ColumnSchema = z.object({
  id: z.string(),
  projectId: z.string().uuid(),
  title: z.string().min(1),
  color: z.string().optional(),
  order: z.number(),
  createdAt: z.string().optional(),
});

export type Column = z.infer<typeof ColumnSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  columnId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  order: z.number(),
  timeSpentMinutes: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

export const SettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type Setting = z.infer<typeof SettingSchema>;
