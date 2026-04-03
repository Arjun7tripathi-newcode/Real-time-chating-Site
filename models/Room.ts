import { Schema, model, models } from "mongoose";

const RoomSchema = new Schema(
  {
    roomId: { type: String, required: true, unique: true }, // Like MEET_XYZ789
    name: { type: String, required: true },
    type: { type: String, enum: ["public", "meeting"], default: "public" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    password: { type: String }, // Optional for meetings
  },
  { timestamps: true }
);

const Room = models.Room || model("Room", RoomSchema);

export default Room;
