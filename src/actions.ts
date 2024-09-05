import { IntegrationProps } from ".botpress"
import { RuntimeError } from "@botpress/sdk"
import { Client, Priority } from "./client"
import { getAccessToken, NO_ACCESS_TOKEN_ERROR } from "./auth"

const createComment: IntegrationProps['actions']['createComment'] = async ({ input, ctx, client }) => {
    const { taskId, content } = input
    const accessToken = await getAccessToken(client, ctx)
    if (!accessToken) {
      throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
    }

    const todoistClient = new Client(accessToken)
    const { id: commentId } = await todoistClient.createComment(taskId, content)
    return { commentId }
  }

  const createTask: IntegrationProps['actions']['createTask'] = async ({ input, ctx, client }) => {
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
  }

  const changeTaskPriority: IntegrationProps['actions']['changeTaskPriority'] = async ({ input, ctx, client }) => {
    const { taskId, priority } = input

    const accessToken = await getAccessToken(client, ctx)
    if (!accessToken) {
      throw new RuntimeError(NO_ACCESS_TOKEN_ERROR)
    }

    const todoistClient = new Client(accessToken)
    await todoistClient.changeTaskPriority(taskId, new Priority(priority))
    return {}
  }

  const getTaskId: IntegrationProps['actions']['getTaskId'] = async ({ input, ctx, client }) => {
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
    createTask,
    changeTaskPriority,
    getTaskId
  } satisfies IntegrationProps['actions']