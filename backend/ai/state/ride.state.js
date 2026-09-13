import { Annotation } from "@langchain/langgraph";

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
    intent: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => "general", 
    })
});
