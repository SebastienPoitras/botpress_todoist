import * as bp from '.botpress'
import { RuntimeError } from '@botpress/sdk'
import { Client, Priority } from './client'
import { getAccessToken, NO_ACCESS_TOKEN_ERROR } from './auth'
import { emptyStrToUndefined } from './utils'

const createComment: bp.IntegrationProps['actions']['createComment'] = async ({ input, ctx, client }) => {
  const { taskId, content } = input
  const accessToken = await getAccessToken(client, ctx)
  if (!accessToken) {
    throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
  }

  const todoistClient = new Client(accessToken)
  const { id: commentId } = await todoistClient.createComment(taskId, content)
  return { commentId }
}

const taskCreate: bp.IntegrationProps['actions']['taskCreate'] = async ({ input, ctx, client }) => {
  const accessToken = await getAccessToken(client, ctx)
  if (!accessToken) {
    throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
  }

  console.log('taskCreate input:', JSON.stringify(input))
  
  // TODO: I don't know the id yet. Will it be empty until I create the task?
  // TODO: Dummy value should be entered for ID in the studio?
  const { content, description, priority, parentTaskId } = input.item
  const todoistClient = new Client(accessToken)
  const task = await todoistClient.createTask({
    content,
    description,
    priority: new Priority(priority),
    parentTaskId: emptyStrToUndefined(parentTaskId),
  })
  
  return {
    item: {
      id: task.id,
      content: task.content,
      description: task.description,
      priority: task.priority.toDisplay(),
      parentTaskId: task.parentTaskId,
    }
  }
}

// TODO: Remove when taskCreate is complete
const createTask: bp.IntegrationProps['actions']['createTask'] = async ({ input, ctx, client }) => {
  const { content, description, priority, parentTaskId } = input
  const accessToken = await getAccessToken(client, ctx)
  if (!accessToken) {
    throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
  }

  const todoistClient = new Client(accessToken)

  const { id: taskId } = await todoistClient.createTask({
    content,
    description,
    priority: new Priority(priority),
    parentTaskId: emptyStrToUndefined(parentTaskId),
  })

  return { taskId }
}

const changeTaskPriority: bp.IntegrationProps['actions']['changeTaskPriority'] = async ({ input, ctx, client }) => {
  const { taskId, priority } = input

  const accessToken = await getAccessToken(client, ctx)
  if (!accessToken) {
    throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
  }

  const todoistClient = new Client(accessToken)
  await todoistClient.changeTaskPriority(taskId, new Priority(priority))
  return {}
}

const getTaskId: bp.IntegrationProps['actions']['getTaskId'] = async ({ input, ctx, client }) => {
  const { name } = input

  const accessToken = await getAccessToken(client, ctx)
  if (!accessToken) {
    throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
  }

  const todoistClient = new Client(accessToken)
  const taskId = await todoistClient.getTaskId(name)
  return { taskId }
}

export default {
  createComment,
  taskCreate,
  createTask,
  changeTaskPriority,
  getTaskId,
} satisfies bp.IntegrationProps['actions']
