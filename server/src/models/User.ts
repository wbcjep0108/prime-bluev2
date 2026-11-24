import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      // The unique index is what guarantees one account per email. Registration
      // relies on its duplicate-key error rather than a check-then-insert.
      unique: true,
    },
    // Absent for accounts created with Google. Never selected by default.
    // Email login opts in with .select('+passwordHash').
    passwordHash: { type: String, select: false },
    // The Google account id (the "sub" claim). Absent for email-only accounts, so
    // the unique index is sparse. Never set this to null: only a missing field is
    // left out of a sparse index. Never selected by default and never returned.
    googleId: { type: String, unique: true, sparse: true, select: false },
  },
  { timestamps: true },
);

export type UserAttributes = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttributes>;

export const User = model('User', userSchema);

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

/** The only shape of a user that may leave the server. */
export function toPublicUser(user: UserDocument): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}
