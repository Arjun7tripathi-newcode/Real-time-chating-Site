import { Schema, model, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    conversationId: { type: String, unique: true, sparse: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// Index for quick lookup of conversations between two users
ConversationSchema.index({ participants: 1 });

const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
