import { TodoistApi } from "@doist/todoist-api-typescript";
import exp from "constants";

export type CreateTaskArgs = {
    content: string;
    description: string;
    priority: Priority;
    parentTaskId?: string;
}

export type Comment = {
    id: string;
    task_id: string;
    content: string;
}

export class Priority {
  static readonly MAX = 4;
  static readonly MIN = 1;

  // Value as seen by the user
  constructor(private value: number) {
    value = Math.min(Priority.MAX, value);
    value = Math.max(Priority.MIN, value);
  }

  static fromApi(value: number): Priority {
    // API considers 4 as the highest priority
    return new Priority(Priority.MAX + 1 - value);
  }

  toApi(): number {
    // API considers 4 as the highest priority
    return Priority.MAX + 1 - this.value;
  }

  toDisplay(): number {
    return this.value;
  }
}
export class Client {
  constructor(private apiToken: string) {}

  async getTaskId(task_name: string): Promise<string | null> {
    const api = new TodoistApi(this.apiToken);
    const tasks = await api.getTasks();
    const task = tasks.find((task) => task.content === task_name);
    return task ? task.id : null;
  }

  async getTaskName(task_id: string): Promise<string> {
    const api = new TodoistApi(this.apiToken);
    const task = await api.getTask(task_id);
    return task.content;
  }

  async createTask(args: CreateTaskArgs): Promise<{ id: string }> {
    const api = new TodoistApi(this.apiToken);
    const task = await api.addTask({
      content: args.content,
      description: args.description,
      priority: args.priority.toApi(),
      parentId: args.parentTaskId,
    });
    return { id: task.id };
  }

  async changeTaskPriority(task_id: string, priority: Priority): Promise<void> {
    const api = new TodoistApi(this.apiToken);
    await api.updateTask(task_id, { priority: priority.toApi() });
  }

  async createComment(task_id: string, content: string): Promise<Comment> {
    const api = new TodoistApi(this.apiToken);
    const comment = await api.addComment({
      taskId: task_id,
      content: content,
    })
    return {
      id: comment.id,
      task_id: comment.taskId!, // Comment was added to a task, so taskId is guaranteed to be defined
      content: comment.content,
    }
  }
}