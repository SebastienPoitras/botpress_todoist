import * as bp from '.botpress'
import { isSupportedEvent, Event, NoteEvent } from './types';
import { VError } from 'verror';

function parseEventJson<TEvent extends Event>(data: string, logger: bp.Logger): TEvent {
    try {
        const parsedEvent = JSON.parse(data);
        const event_name = parsedEvent.event_name;
        if (!event_name || !isSupportedEvent(event_name)) {
            logger.forBot().warn("Handler received request from Todoist with invalid event_name: ", event_name);
            throw new Error('Invalid event_name');
        }
        return parsedEvent as TEvent;
    }
    catch (e) {
        throw new VError(e as Error, 'Body is invalid for Event');
    }
}

export const handler: bp.IntegrationProps['handler'] = async ({ req, client, logger }) => {
    if (!req.body) {
        logger.forBot().warn("Handler received empty request from Todoist");
        return {
            status: 400,
            body: 'Empty request body',
        };
    }
    logger.forBot().info("Handler received request from Todoist with payload: ", req.body);

    const noteEvent = parseEventJson<NoteEvent>(req.body, logger); 
    const conversationId = noteEvent.event_data.item_id;
    const userId = noteEvent.event_data.posted_uid;
    const commentId = noteEvent.event_data.id;

    console.log(noteEvent);

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
            text: noteEvent.event_data.content,
        }
    })

    return {
        status: 200,
        body: 'OK',
    };
}