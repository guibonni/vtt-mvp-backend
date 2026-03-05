import jwt, { type SignOptions } from "jsonwebtoken";

type JwtExpiresIn = Exclude<SignOptions["expiresIn"], undefined>;

const JWT_EXPIRES_IN: JwtExpiresIn =
  (process.env.JWT_EXPIRES_IN as JwtExpiresIn | undefined) ?? "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return secret;
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret());
}
