import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  full_name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["tenant", "owner", "manager", "admin"],
    default: "tenant",
  },
  credits: {
    type: Number,
    default: 0,
    min: 0,
  },
  whatsapp_number: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
