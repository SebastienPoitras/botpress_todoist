import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import { Client } from './client'
import { handler } from './handler'

export default new bp.Integration({
  register: async ({logger}) => {
    logger.forBot().info("Registering Todoist integration");
  },
  unregister: async ({logger}) => {
    logger.forBot().info("Unregistering Todoist integration");
  },
  actions: {
    createComment: async ({input, ctx}) => {
      const { taskId, content } = input;
      const todoistClient = new Client(ctx.configuration.apiToken);
      const comment = await todoistClient.createComment(taskId, content);
      return { commentId: comment.id }
    }
 
  },
  channels: {
    comments: {
      messages: {
        text: async ({conversation, ctx, ack, payload, logger}) => {
          const taskId = conversation.tags['id']!;
          const content = payload.text;
          
          const todoistClient = new Client(ctx.configuration.apiToken);
          logger.forBot().info(`Creating comment on task "${taskId}" with content: "${content}"`);
          const comment = await todoistClient.createComment(taskId, content);
          await ack({tags: { "id": comment.id }});
        }
      }
    }
  },
  handler: handler, 
})
