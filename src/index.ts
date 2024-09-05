import * as bp from '.botpress'
import { Client, Priority } from './client'
import { handler } from './handler'
import { getAccessToken } from './auth'
import { RuntimeError } from '@botpress/sdk'

const NO_ACCESS_TOKEN_ERROR =
  'No access token found. Please authenticate with Todoist first or manually set an access token.'

export default new bp.Integration({
  register: async ({ logger }) => {
    logger.forBot().info('Registering Todoist integration')
  },
  unregister: async ({ logger }) => {
    logger.forBot().info('Unregistering Todoist integration')
  },
  actions: {
    createComment: async ({ input, ctx, client }) => {
      const { taskId, content } = input
      const accessToken = await getAccessToken(client, ctx)
      if (!accessToken) {
        throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
      }

      const todoistClient = new Client(accessToken)
      const { id: commentId } = await todoistClient.createComment(taskId, content)
      return { commentId }
    },
    createTask: async ({ input, ctx, client }) => {
      const { content, description, priority } = input

      let { parentTaskId } = input
      parentTaskId = parentTaskId === '' ? undefined : parentTaskId // studio sends an empty string if the field is empty

      const accessToken = await getAccessToken(client, ctx)
      if (!accessToken) {
        throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
      }

      const todoistClient = new Client(accessToken)

      const { id: taskId } = await todoistClient.createTask({
        content,
        description,
        priority: new Priority(priority),
        parentTaskId,
      })

      return { taskId }
    },
    changeTaskPriority: async ({ input, ctx, client }) => {
      const { taskId, priority } = input

      const accessToken = await getAccessToken(client, ctx)
      if (!accessToken) {
        throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
      }

      const todoistClient = new Client(accessToken)
      await todoistClient.changeTaskPriority(taskId, new Priority(priority))
      return {}
    },
    getTaskId: async ({ input, ctx, client }) => {
      const { name } = input

      const accessToken = await getAccessToken(client, ctx)
      if (!accessToken) {
        throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
      }

      const todoistClient = new Client(accessToken)
      const taskId = await todoistClient.getTaskId(name)
      return { taskId }
    },
  },
  channels: {
    comments: {
      messages: {
        text: async ({ conversation, ctx, ack, payload, logger, client }) => {
          const taskId = conversation.tags['id']!
          const content = payload.text

          const accessToken = await getAccessToken(client, ctx)
          if (!accessToken) {
            throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
          }

          const todoistClient = new Client(accessToken)
          logger.forBot().info(`Creating comment on task "${taskId}" with content: "${content}"`)
          const comment = await todoistClient.createComment(taskId, content)
          await ack({ tags: { id: comment.id } })
        },
      },
    },
  },
  handler,
})
