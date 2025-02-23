import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string;
  password?: string;
  username?: string;
  googleId?: string;
  facebookId?: string;
  _id?: string;
  refreshToken?: string[];
  matchPassword?(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values and maintains uniqueness for non-null values
  },
  password: {
    type: String,
    required: function(this: IUser) {
      // Only require password if not using OAuth
      return !this.googleId && !this.facebookId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  }
});

// Password hashing middleware
userSchema.pre("save", async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to validate password
userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;