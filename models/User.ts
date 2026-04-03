import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true }, // Short ID like CHAT_ABC123
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
