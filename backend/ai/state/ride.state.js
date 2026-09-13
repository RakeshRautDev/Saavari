import { Annotation } from "@langchain/langgraph";

// The state channels for the Passenger Assistant LangGraph
export const PassengerGraphState = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    userId: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    currentRideId: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    // User intent tracking
    intent: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => "general", // "book_ride", "cancel_ride", "query_status", "general"
    })
});
