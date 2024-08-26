import * as bp from '.botpress'
import { isSupportedEvent, Event, NoteEvent, ItemEvent, isSupportedNoteEvent, isSupportedItemEvent, isItemUpdateEvent } from './types';
import { VError } from 'verror';
import { RuntimeError } from '@botpress/client';
import { Priority } from './client';

const ResponseOk = {
    status: 200,
    body: 'OK',
};

function parseEventJson(data: string, logger: bp.Logger): Event {
    try {
        const parsedEvent = JSON.parse(data);
        if (!isSupportedEvent(parsedEvent)) {
            logger.forBot().warn("Handler received request from Todoist with invalid event: ", parsedEvent);
            throw new Error('Invalid event');
        }
        return parsedEvent;
    }
    catch (e) {
        throw new VError(e as Error, 'Body is invalid for Event');
    }
}

async function handleNoteEvent(event: NoteEvent, props: bp.HandlerProps) {
    let { client, logger } = props;
    logger.forBot().info("Received note:added event");

    const conversationId = event.event_data.item_id;
    const userId = event.event_data.posted_uid;
    const commentId = event.event_data.id;
    const { conversation } = await client.getOrCreateConversation({
        channel: 'comments',
        tags: { 'id': conversationId },
    });

    const { user } = await client.getOrCreateUser({
        tags: { 'id': userId },
    });

    await client.getOrCreateMessage({
        tags: { 'id': commentId },
        type: 'text',
        userId: user.id,
        conversationId: conversation.id,
        payload: {
            text: event.event_data.content,
        }
    })

    return ResponseOk;
}

async function onItemAdded(event: ItemEvent, props: bp.HandlerProps) {
    let { client, logger } = props;
    logger.forBot().info("Received item:added event");
    console.log({
        id: event.event_data.id,
        user_id: event.event_data.user_id,
        content: event.event_data.content,
        description: event.event_data.description,
        priority: event.event_data.priority,
    });

    await client.createEvent({
        type: 'taskAdded',
        payload: {
            id: event.event_data.id,
            user_id: event.event_data.user_id,
            content: event.event_data.content,
            description: event.event_data.description,
            priority: event.event_data.priority,
        }
    })

    return ResponseOk;
}

async function onItemUpdated(event: ItemEvent, props: bp.HandlerProps) {
    let { client, logger } = props;
    if(!isItemUpdateEvent(event)) {
        logger.forBot().warn("Received item:updated event with invalid data");
        throw new Error('Invalid item:updated event');
    }
    logger.forBot().info("Received item:updated event");

    const newPriority = event.event_data.priority;
    const oldPriority = event.event_data_extra.old_item.priority;
    if(newPriority !== oldPriority) {
        await client.createEvent({
            type: 'taskPriorityChanged',
            payload: {
                id: event.event_data.id,
                newPriority: Priority.fromApi(newPriority).toDisplay(),
                oldPriority: Priority.fromApi(oldPriority).toDisplay(),
            }
        })        
    }

    return ResponseOk;
}

async function onItemCompleted(event: ItemEvent, props: bp.HandlerProps) {
    let { client, logger } = props;
    logger.forBot().info("Received item:completed event");
    await client.createEvent({
        type: 'taskCompleted',
        payload: {
            id: event.event_data.id,
            user_id: event.event_data.user_id,
            content: event.event_data.content,
            description: event.event_data.description,
            priority: event.event_data.priority,
        }
    });

    return ResponseOk;
}

async function handleItemEvent(event: ItemEvent, props: bp.HandlerProps) {
    var response;
    switch (event.event_name) {
        case 'item:added':
            response = onItemAdded(event, props);
            break;
        case 'item:updated':
            response = onItemUpdated(event, props);
            break;
        case 'item:completed':
            response = onItemCompleted(event, props);
            break;
        default:
            response = {
                status: 400,
                body: 'Unsupported event type',
            };
            break; 
    }
    return response
}

export const handler: bp.IntegrationProps['handler'] = async (props: bp.HandlerProps) => {
    let { req, logger } = props;
    if (!req.body) {
        logger.forBot().warn("Handler received empty request from Todoist");
        return {
            status: 400,
            body: 'Empty request body',
        };
    }
    logger.forBot().info("Handler received request from Todoist with payload: ", req.body);

    const event = parseEventJson(req.body, logger);
    if (isSupportedNoteEvent(event)) {
        return handleNoteEvent(event, props);
    } else if (isSupportedItemEvent(event)) {
        return handleItemEvent(event, props);
    }

    return {
        status: 400,
        body: 'Unsupported event type',
    };
}