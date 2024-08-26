import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import { Client, Priority } from './client'
import { handler } from './handler'

export default new bp.Integration({
  register: async ({ logger }) => {
    logger.forBot().info("Registering Todoist integration");
  },
  unregister: async ({ logger }) => {
    logger.forBot().info("Unregistering Todoist integration");
  },
  actions: {
    createComment: async ({ input, ctx }) => {
      const { taskId, content } = input;
      const todoistClient = new Client(ctx.configuration.apiToken);
      const comment = await todoistClient.createComment(taskId, content);
      return { commentId: comment.id };
    }, 
    createTask: async ({ input, ctx }) => { 
      const { content, description, priority } = input;
      let { parentTaskId } = input;
      const todoistClient = new Client(ctx.configuration.apiToken);
      console.log(input) 
      if(typeof parentTaskId === 'string') { // TODO: See why studio is setting to empty string
        parentTaskId = parentTaskId.length === 0 ? undefined : parentTaskId;
      }
      const task = await todoistClient.createTask({ content, description, priority: new Priority(priority), parentTaskId });
      return { taskId: task.id };
    },
    changeTaskPriority: async ({ input, ctx }) => {
      const { taskId, priority } = input;
      const todoistClient = new Client(ctx.configuration.apiToken);
      await todoistClient.changeTaskPriority(taskId, new Priority(priority));
      return {};
    },
    getTaskId: async ({ input, ctx }) => {
      const { name } = input;
      const todoistClient = new Client(ctx.configuration.apiToken);
      const taskId = await todoistClient.getTaskId(name);
      console.log(taskId);
      return { taskId: taskId };
    }
  },
  channels: {
    comments: {
      messages: {
        text: async ({ conversation, ctx, ack, payload, logger }) => {
          const taskId = conversation.tags['id']!;
          const content = payload.text;

          const todoistClient = new Client(ctx.configuration.apiToken);
          logger.forBot().info(`Creating comment on task "${taskId}" with content: "${content}"`);
          const comment = await todoistClient.createComment(taskId, content);
          await ack({ tags: { "id": comment.id } });
        }
      }
    }
  },
  handler: handler,
})
