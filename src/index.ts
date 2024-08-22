import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import { Client } from './client'

export default new bp.Integration({
  register: async ({logger}) => {
    /**
     * This is called when a bot installs the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    logger.forBot().info("Registering Todoist integration");
  },
  unregister: async ({logger}) => {
    /**
     * This is called when a bot removes the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    logger.forBot().info("Unregistering Todoist integration");
  },
  actions: {

  },
  channels: {
    comments: {
      messages: {
        text: async ({ctx, ack, payload, logger}) => {
          logger.forBot().info(`Creating comment on task "${ctx.configuration.taskName}"`);

          const todoistClient = new Client(ctx.configuration.apiToken);
          const comment = await todoistClient.createComment(ctx.configuration.taskName, payload.text);
          await ack({tags: { "id": `todoist:${comment.id}` }});
        }
      }
    }
  },
  handler: async () => {},
})
