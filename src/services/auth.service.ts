import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { sendVerificationCodeEmail } from "./email.service";

const PASSWORD_HASH_ROUNDS = 10;
const VERIFICATION_CODE_HASH_ROUNDS = 10;
const VERIFICATION_CODE_EXPIRATION_MINUTES = 10;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email já registrado");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  const verificationCode = generateVerificationCode();
  const codeHash = await bcrypt.hash(
    verificationCode,
    VERIFICATION_CODE_HASH_ROUNDS,
  );
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRATION_MINUTES * 60 * 1000,
  );

  await prisma.pendingUserRegistration.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      passwordHash,
      codeHash,
      expiresAt,
    },
    create: {
      name,
      email: normalizedEmail,
      passwordHash,
      codeHash,
      expiresAt,
    },
  });

  await sendVerificationCodeEmail(normalizedEmail, verificationCode);

  return {
    message: "Código de verificação enviado para o email informado.",
    email: normalizedEmail,
  };
}

export async function verifyRegisterCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);

  const pendingRegistration = await prisma.pendingUserRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pendingRegistration) {
    throw new Error("Cadastro pendente não encontrado");
  }

  if (pendingRegistration.expiresAt.getTime() < Date.now()) {
    await prisma.pendingUserRegistration.delete({
      where: { email: normalizedEmail },
    });

    throw new Error("Código de verificação expirado");
  }

  const isValidCode = await bcrypt.compare(code, pendingRegistration.codeHash);

  if (!isValidCode) {
    throw new Error("Código de verificação inválido");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    await prisma.pendingUserRegistration.delete({
      where: { email: normalizedEmail },
    });

    throw new Error("Email já registrado");
  }

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        passwordHash: pendingRegistration.passwordHash,
      },
    });

    await tx.pendingUserRegistration.delete({
      where: { email: normalizedEmail },
    });

    return createdUser;
  });

  const token = generateToken(user.id);

  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    throw new Error("Credenciais inválidas");
  }

  const token = generateToken(user.id);

  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
}
