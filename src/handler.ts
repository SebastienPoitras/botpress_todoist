import * as bp from '.botpress'
import { NoteEvent, ItemAddedEvent, ItemCompletedEvent, ItemUpdatedEvent, eventSchema } from './types'
import { Priority } from './client'

const RESPONSE_OK = {
  status: 200,
  body: 'OK',
}

async function handleNoteEvent(event: NoteEvent, { client }: bp.HandlerProps) {
  const conversationId = event.event_data.item_id
  const userId = event.event_data.posted_uid
  const commentId = event.event_data.id
  const { conversation } = await client.getOrCreateConversation({
    channel: 'comments',
    tags: { id: conversationId },
  })

  const { user } = await client.getOrCreateUser({
    tags: { id: userId },
  })

  await client.getOrCreateMessage({
    tags: { id: commentId },
    type: 'text',
    userId: user.id,
    conversationId: conversation.id,
    payload: {
      text: event.event_data.content,
    },
  })

  return RESPONSE_OK
}

async function onItemAdded(event: ItemAddedEvent, { client }: bp.HandlerProps) {
  await client.createEvent({
    type: 'taskAdded',
    payload: {
      id: event.event_data.id,
      user_id: event.event_data.user_id,
      content: event.event_data.content,
      description: event.event_data.description,
      priority: event.event_data.priority,
    },
  })

  return RESPONSE_OK
}

async function onItemUpdated(event: ItemUpdatedEvent, { client }: bp.HandlerProps) {
  const newPriority = event.event_data.priority
  const oldPriority = event.event_data_extra.old_item.priority

  if (newPriority !== oldPriority) {
    await client.createEvent({
      type: 'taskPriorityChanged',
      payload: {
        id: event.event_data.id,
        newPriority: Priority.fromApi(newPriority).toDisplay(),
        oldPriority: Priority.fromApi(oldPriority).toDisplay(),
      },
    })
  }

  return RESPONSE_OK
}

async function onItemCompleted(event: ItemCompletedEvent, { client }: bp.HandlerProps) {
  await client.createEvent({
    type: 'taskCompleted',
    payload: {
      id: event.event_data.id,
      user_id: event.event_data.user_id,
      content: event.event_data.content,
      description: event.event_data.description,
      priority: event.event_data.priority,
    },
  })

  return RESPONSE_OK
}

export const handler: bp.IntegrationProps['handler'] = async (props: bp.HandlerProps) => {
  let { req, logger } = props
  if (!req.body) {
    logger.forBot().warn('Handler received empty request from Todoist')
    return {
      status: 400,
      body: 'Empty request body',
    }
  }
  logger.forBot().info('Handler received request from Todoist with payload: ', req.body)

  let eventData: any
  try {
    eventData = JSON.parse(req.body)
  } catch (e) {
    logger.forBot().warn('Handler received request from Todoist with invalid JSON: ', req.body)
    return {
      status: 400,
      body: 'Invalid JSON',
    }
  }

  const parseResult = eventSchema.safeParse(eventData)
  if (!parseResult.success) {
    logger.forBot().warn('Handler received request from Todoist with unsuported payload: ', eventData, 'Error: ', parseResult.error)
    return {
      status: 400,
      body: 'Invalid event',
    }
  }

  const { data: event } = parseResult

  logger.forBot().info(`Received event: ${event.event_name}`)

  if (event.event_name === 'note:added') {
    return handleNoteEvent(event, props)
  }

  if (event.event_name === 'item:added') {
    return onItemAdded(event, props)
  }

  if (event.event_name === 'item:updated') {
    return onItemUpdated(event, props)
  }

  if (event.event_name === 'item:completed') {
    return onItemCompleted(event, props)
  }

  return {
    status: 400,
    body: 'Unsupported event type',
  }
}
