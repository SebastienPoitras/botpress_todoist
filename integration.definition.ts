import { z, IntegrationDefinition, messages } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '0.0.1',
  readme: 'hub.md',
  icon: 'icon.svg',
  channels: {
    comments: {
      messages: {
        text: messages.defaults.text
      },
      conversation: {
        tags: {
          id: {
            title: 'Task ID',
            description: 'The ID of the task',
          }
        }
      },
      message: {
        tags: {
          id: {
            title: 'Comment ID',
            description: 'The ID of the comment',
          }
        }
      }  
    }
  },
  configuration: {
    schema: z.object({
      apiToken: z.string(), // TODO: Make this a secret
      taskName: z.string() // TODO: Should correspond to a unique conversation instead of a parameter
    })
  }
})
