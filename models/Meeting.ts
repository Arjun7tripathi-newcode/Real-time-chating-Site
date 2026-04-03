import { Schema, model, models } from "mongoose";

const MeetingSchema = new Schema(
  {
    meetingId: { type: String, required: true, unique: true },
    title: { type: String, default: "New Meeting" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const Meeting = models.Meeting || model("Meeting", MeetingSchema);
export default Meeting;
