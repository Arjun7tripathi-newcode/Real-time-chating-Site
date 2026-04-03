import { Schema, model, models } from "mongoose";

const PrivateGroupSchema = new Schema(
  {
    privateChatId: { type: String, required: true, unique: true }, // PVT_XXXXXX
    name: { type: String, default: "Private Group" },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "GroupMessage" },
  },
  { timestamps: true }
);

PrivateGroupSchema.index({ participants: 1 });

const PrivateGroup =
  models.PrivateGroup || model("PrivateGroup", PrivateGroupSchema);

export default PrivateGroup;
