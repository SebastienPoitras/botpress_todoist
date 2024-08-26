const supportedItemEventTypes = ['item:added', 'item:completed', 'item:updated'] as const;
export type ItemEventType = typeof supportedItemEventTypes[number];

const supportedNoteEventTypes = ['note:added'] as const;
export type NoteEventType = typeof supportedNoteEventTypes[number];

export type EventType = ItemEventType | NoteEventType; // Extend this type with other event types

// Event data types
type ItemEventData = {
    id: string,
    user_id: string, // The owner of the task
    content: string,
    description: string,
    priority: number,
}
type ItemUpdateEventDataExtra = {
    old_item: ItemEventData,
    update_intent: 'item_updated' | 'item_completed' | 'item_uncompleted'
}
type ItemEventDataExtra = null | ItemUpdateEventDataExtra;

type NoteEventData = {
    id: string,
    posted_uid: string, // The ID of the user who posted the note
    item_id: string,
    content: string,
}

type EventData = ItemEventData | NoteEventData; // Extend this type with other event data types
type EventDataExtra = null | ItemEventDataExtra; // Extend this type with other event data extra types

type EventImpl<TEventType, TEventData, TEventDataExtra = null> = {
    event_name: TEventType,
    user_id: string,
    event_data: TEventData,
    event_data_extra: TEventDataExtra
}
export type Event = EventImpl<EventType, EventData, EventDataExtra>;
export type NoteEvent = EventImpl<NoteEventType, NoteEventData>;

export type ItemEvent = EventImpl<ItemEventType, ItemEventData, ItemEventDataExtra>;
export type ItemUpdateEvent = ItemEvent & {
        event_name: 'item:updated';
        event_data_extra: ItemUpdateEventDataExtra;
    };

// Type guards
function isSupportedEventSubtypeImpl<TEventType>(eventTypeStr: any, supportedEventTypes: readonly TEventType[]): eventTypeStr is TEventType {
    return supportedEventTypes.includes(eventTypeStr as TEventType);
}

export function isSupportedItemEvent(event: Event): event is ItemEvent {
    return isSupportedEventSubtypeImpl<ItemEventType>(event.event_name, supportedItemEventTypes);
}

export function isItemUpdateEvent(event: ItemEvent): event is ItemUpdateEvent {
    return event.event_name === 'item:updated';
}

export function isSupportedNoteEvent(event: Event): event is NoteEvent {
    return isSupportedEventSubtypeImpl<NoteEventType>(event.event_name, supportedNoteEventTypes);
}

export function isSupportedEvent(event: Event): event is Event {
    return isSupportedItemEvent(event) || isSupportedNoteEvent(event);
}