import { Schema, model, models } from "mongoose";

const GroupMessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    privateChatId: { type: String, required: true }, // links by privateChatId string
    text: { type: String, required: true },
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

GroupMessageSchema.index({ privateChatId: 1, createdAt: 1 });
GroupMessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete via MongoDB TTL

const GroupMessage =
  models.GroupMessage || model("GroupMessage", GroupMessageSchema);

export default GroupMessage;
