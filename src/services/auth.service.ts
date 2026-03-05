import bcrypt from "bcrypt"
import { prisma } from "../config/prisma"
import { generateToken } from "../utils/jwt"

export async function registerUser(name: string, email: string, password: string) {

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("Email já registrado")
  }

  const passwordHashCreation = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: passwordHashCreation
    }
  })

  const token = generateToken(user.id)

  const { passwordHash, ...safeUser } = user

  return { user: safeUser, token }
}

export async function loginUser(email: string, password: string) {

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Credenciais inválidas")
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    throw new Error("Credenciais inválidas")
  }

  const token = generateToken(user.id)

  const { passwordHash, ...safeUser } = user

  return { user: safeUser, token }
}