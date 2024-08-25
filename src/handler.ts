import * as bp from '.botpress'
import { isSupportedEvent, Event, NoteEvent, ItemEvent, isSupportedNoteEvent, isSupportedItemEvent } from './types';
import { VError } from 'verror';

function parseEventJson(data: string, logger: bp.Logger): Event {
    try {
        const parsedEvent = JSON.parse(data);
        if (!isSupportedEvent(parsedEvent)) {
            logger.forBot().warn("Handler received request from Todoist with invalid event: ", parsedEvent);
            throw new Error('Invalid event_name');
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

    return {
        status: 200,
        body: 'OK',
    };
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

    return {
        status: 200,
        body: 'OK',
    };
}

async function handleItemEvent(event: ItemEvent, props: bp.HandlerProps) {
    var response;
    switch (event.event_name) {
        case 'item:added':
            response = onItemAdded(event, props);
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