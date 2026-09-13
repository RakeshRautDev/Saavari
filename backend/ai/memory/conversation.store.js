import mongoose from "mongoose";

const checkpointerSchema = new mongoose.Schema({
    thread_id: { type: String, required: true, index: true },
    checkpoint_ns: { type: String, default: "" },
    checkpoint_id: { type: String, required: true },
    parent_checkpoint_id: { type: String },
    type: { type: String },
    checkpoint: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// A very basic MongoDB Saver for LangGraph StateGraph memory
export const CheckpointModel = mongoose.model("Checkpoints", checkpointerSchema);

export class MongoDBSaver {
    async getTuple(config) {
        const { configurable } = config;
        const thread_id = configurable?.thread_id;
        if (!thread_id) return undefined;
        
        const doc = await CheckpointModel.findOne({ thread_id }).sort({ createdAt: -1 });
        if (!doc) return undefined;
        
        return {
            config: { configurable: { thread_id: doc.thread_id, checkpoint_ns: doc.checkpoint_ns, checkpoint_id: doc.checkpoint_id } },
            checkpoint: doc.checkpoint,
            metadata: doc.metadata,
            parentConfig: doc.parent_checkpoint_id ? { configurable: { thread_id, checkpoint_id: doc.parent_checkpoint_id } } : undefined
        };
    }
    
    async put(config, checkpoint, metadata) {
        const { configurable } = config;
        const thread_id = configurable?.thread_id;
        
        await CheckpointModel.create({
            thread_id,
            checkpoint_ns: configurable?.checkpoint_ns || "",
            checkpoint_id: checkpoint.id,
            parent_checkpoint_id: config.configurable?.checkpoint_id,
            checkpoint,
            metadata
        });
        
        return { configurable: { thread_id, checkpoint_ns: configurable?.checkpoint_ns || "", checkpoint_id: checkpoint.id } };
    }
    
    async putWrites(config, writes, taskId) {
        // Simple mock implementation for putWrites
        return;
    }
    
    getNextVersion(version, step) {
        return version ? (parseInt(version, 10) + 1).toString() : "1";
    }
}
