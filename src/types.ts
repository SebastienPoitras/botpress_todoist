const supportedNoteEventTypes = ['note:added'] as const;
export type NoteEventType = typeof supportedNoteEventTypes[number];

export type EventType = NoteEventType; // Extend this type with other event types

type EventImpl<TEventType, TEventData> = {
    event_name: TEventType,
    user_id: string,
    event_data: TEventData
}

type NoteEventData = { 
    id: string,
    posted_uid: string, // The ID of the user who posted the note
    item_id: string,
    content: string,
}

export type Event = EventImpl<EventType, any>;
export type NoteEvent = EventImpl<NoteEventType, NoteEventData>;

function isSupportedEventImpl<TEventType>(eventTypeStr: any, supportedEventTypes: readonly TEventType[]): eventTypeStr is TEventType {
    return supportedEventTypes.includes(eventTypeStr as TEventType);
}

export function isSupportedEvent(eventTypeStr: string): eventTypeStr is EventType {
    return isSupportedEventImpl<NoteEventType>(eventTypeStr, supportedNoteEventTypes);
}