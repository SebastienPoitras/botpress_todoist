import { TodoistApi } from "@doist/todoist-api-typescript";

export type Comment = {
    id: string;
    task_id: string;
    content: string;
}

export class Client {
  constructor(private apiToken: string) {}

  async getTaskId(task_name: string): Promise<string> {
    const api = new TodoistApi(this.apiToken);
    const tasks = await api.getTasks();
    const task = tasks.find((task) => task.content === task_name);
    if (!task) {
      throw new Error(`Task with name "${task_name}" not found`);
    }
    return task.id;
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
