import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // One of these will be set depending on the chat type
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["private", "public", "meeting", "group"],
      required: true,
    },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date }, // For disappearing messages
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      }
    ]
  },
  { timestamps: true }
);

// Indexes for fast message retrieval
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ roomId: 1, createdAt: 1 });
MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete via MongoDB TTL

const Message = models.Message || model("Message", MessageSchema);

export default Message;
