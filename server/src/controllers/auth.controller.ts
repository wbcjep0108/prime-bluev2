import { randomBytes } from 'node:crypto';
import type { RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import { HttpError } from '../middleware/errorHandler.js';
import { getAuthUserId } from '../middleware/requireAuth.js';
import { User, toPublicUser } from '../models/User.js';
import { verifyGoogleCredential, type GoogleIdentity } from '../utils/google.js';
import { clearSessionCookie, setSessionCookie, signSessionToken } from '../utils/session.js';
import {
  PASSWORD_MAX_BYTES,
  parseGoogleBody,
  parseLoginBody,
  parseRegisterBody,
} from '../validators/auth.validators.js';

const BCRYPT_COST = 12;
const VALIDATION_MESSAGE = 'Please check the form and try again.';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
const GOOGLE_FAILED_MESSAGE = 'Google sign-in failed. Please try again.';

// Hash compared against when no usable stored hash exists (unknown email, or a
// Google-only account), so those cases cost about the same time as a wrong
// password. It is made from random bytes, so no input can ever match it.
// Computed once, on first use.
let dummyHash: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_COST);
  return dummyHash;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

export const register: RequestHandler = async (req, res) => {
  const parsed = parseRegisterBody(req.body);
  if (!parsed.ok) {
    throw new HttpError(400, VALIDATION_MESSAGE, parsed.fieldErrors);
  }
  const { name, email, password } = parsed.value;

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  try {
    const user = await User.create({ name, email, passwordHash });
    // Registration does not sign the user in. The client sends them to log in.
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    // The unique index decides. A pre-check would race with a concurrent signup.
    if (isDuplicateKeyError(err)) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    throw err;
  }
};

export const login: RequestHandler = async (req, res) => {
  const parsed = parseLoginBody(req.body);
  if (!parsed.ok) {
    throw new HttpError(400, VALIDATION_MESSAGE, parsed.fieldErrors);
  }
  const { email, password } = parsed.value;

  const user = await User.findOne({ email }).select('+passwordHash');

  // Undefined for an unknown email and for an account created with Google.
  const storedHash = user?.passwordHash;

  // Over-long passwords can never match a stored hash, so they get the same
  // generic failure instead of a distinguishing error.
  const tooLong = Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES;
  const passwordMatches = await bcrypt.compare(
    tooLong ? '' : password,
    storedHash ?? (await getDummyHash()),
  );

  // The explicit storedHash check matters: without it, a match against the
  // dummy hash would be accepted for an account that has no password.
  if (!user || !storedHash || !passwordMatches || tooLong) {
    throw new HttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  setSessionCookie(res, signSessionToken(user.id));
  res.status(200).json({ user: toPublicUser(user) });
};

async function loginWithGoogle(identity: GoogleIdentity, res: Response): Promise<void> {
  let user = await User.findOne({ googleId: identity.googleId }).select('+googleId');

  if (!user) {
    user = await User.findOne({ email: identity.email }).select('+googleId');
    if (!user) {
      throw new HttpError(404, 'No account found. Please register first.');
    }

    // The email belongs to an account already linked to a different Google account.
    if (user.googleId && user.googleId !== identity.googleId) {
      throw new HttpError(401, GOOGLE_FAILED_MESSAGE);
    }

    // First Google login for an existing email account: link it. Google has
    // verified this email, and the filter makes the link atomic.
    if (!user.googleId) {
      try {
        const linked = await User.updateOne(
          { _id: user._id, googleId: { $exists: false } },
          { $set: { googleId: identity.googleId } },
        );
        if (linked.modifiedCount === 0) {
          // Another request linked it first. Continue only if it was this same Google account.
          const current = await User.findOne({ googleId: identity.googleId });
          if (!current || current.id !== user.id) {
            throw new HttpError(401, GOOGLE_FAILED_MESSAGE);
          }
        }
      } catch (err) {
        // This Google account is already linked to some other user.
        if (isDuplicateKeyError(err)) {
          throw new HttpError(401, GOOGLE_FAILED_MESSAGE);
        }
        throw err;
      }
    }
  }

  setSessionCookie(res, signSessionToken(user.id));
  res.status(200).json({ user: toPublicUser(user) });
}

async function registerWithGoogle(identity: GoogleIdentity, res: Response): Promise<void> {
  const existsMessage = 'An account with this email already exists. Please log in.';

  const existing = await User.exists({
    $or: [{ googleId: identity.googleId }, { email: identity.email }],
  });
  if (existing) {
    throw new HttpError(409, existsMessage);
  }

  try {
    const user = await User.create({
      name: identity.name,
      email: identity.email,
      googleId: identity.googleId,
    });
    // Same as email registration: no cookie. The client sends them to log in.
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    // A concurrent signup can slip past the check above. The unique indexes decide.
    if (isDuplicateKeyError(err)) {
      throw new HttpError(409, existsMessage);
    }
    throw err;
  }
}

export const google: RequestHandler = async (req, res) => {
  const parsed = parseGoogleBody(req.body);
  if (!parsed.ok) {
    throw new HttpError(400, VALIDATION_MESSAGE, parsed.fieldErrors);
  }
  const { credential, mode } = parsed.value;

  const identity = await verifyGoogleCredential(credential);

  if (mode === 'login') {
    await loginWithGoogle(identity, res);
  } else {
    await registerWithGoogle(identity, res);
  }
};

export const logout: RequestHandler = (_req, res) => {
  clearSessionCookie(res);
  res.status(200).json({ message: 'Logged out' });
};

export const me: RequestHandler = async (_req, res) => {
  const user = await User.findById(getAuthUserId(res));

  // The token was valid but the account no longer exists.
  if (!user) {
    clearSessionCookie(res);
    throw new HttpError(401, 'Authentication required');
  }

  res.status(200).json({ user: toPublicUser(user) });
};
