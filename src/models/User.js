import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["student", "industry", "workforce"],
      default: "student",
      lowercase: true,
      trim: true,
    },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  const targetPassword = this.password || this.passwordHash;
  if (!targetPassword) return;

  if (this.isModified("password") || this.isModified("passwordHash")) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(targetPassword, salt);
    this.passwordHash = hash;
    this.password = hash;
  }
});

// Compare candidate password with passwordHash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const hash = this.passwordHash || this.password;
  if (!hash) return false;
  return bcrypt.compare(candidatePassword, hash);
};

// Safe JSON serialization (never send password or passwordHash to client)
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
