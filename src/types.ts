const supportedItemEventTypes = ['item:added'] as const;
export type ItemEventType = typeof supportedItemEventTypes[number];

const supportedNoteEventTypes = ['note:added'] as const;
export type NoteEventType = typeof supportedNoteEventTypes[number];

export type EventType = ItemEventType | NoteEventType; // Extend this type with other event types

type ItemEventData = { 
    id: string,
    user_id: string, // The owner of the task
    content: string,
    description: string,
    priority: number,
}
type NoteEventData = { 
    id: string,
    posted_uid: string, // The ID of the user who posted the note
    item_id: string,
    content: string,
}
type EventData = ItemEventData | NoteEventData;

type EventImpl<TEventType, TEventData> = {
    event_name: TEventType,
    user_id: string,
    event_data: TEventData
}
export type Event = EventImpl<EventType, EventData>;
export type NoteEvent = EventImpl<NoteEventType, NoteEventData>;
export type ItemEvent = EventImpl<ItemEventType, ItemEventData>;

function isSupportedEventSubtypeImpl<TEventType>(eventTypeStr: any, supportedEventTypes: readonly TEventType[]): eventTypeStr is TEventType {
    return supportedEventTypes.includes(eventTypeStr as TEventType);
}

export function isSupportedItemEvent(event: Event): event is ItemEvent {
    return isSupportedEventSubtypeImpl<ItemEventType>(event.event_name, supportedItemEventTypes);
}

export function isSupportedNoteEvent(event: Event): event is NoteEvent {
    return isSupportedEventSubtypeImpl<NoteEventType>(event.event_name, supportedNoteEventTypes);
}

export function isSupportedEvent(event: Event): event is Event {
    return isSupportedItemEvent(event) || isSupportedNoteEvent(event);
}