import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

export async function createSession(
  name: string,
  password: string | null,
  userId: string,
) {
  let passwordHash: string | null = null;

  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const session = await prisma.session.create({
    data: {
      name,
      passwordHash,
      createdById: userId,
      participants: {
        create: {
          userId,
        },
      },
    },
  });

  return session;
}

export async function listSessions(userId: string) {
  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      participants: {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return sessions.map(({ participants, ...session }) => ({
    ...session,
    isParticipant: participants.length > 0,
  }));
}

export async function joinSession(
  sessionId: string,
  password: string | undefined,
  userId: string,
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Sessão não encontrada");
  }

  if (session.passwordHash) {
    if (!password) {
      throw new Error("Senha necessária");
    }

    const valid = await bcrypt.compare(password, session.passwordHash);

    if (!valid) {
      throw new Error("Senha incorreta");
    }
  }

  const participant = await prisma.sessionParticipant.upsert({
    where: {
      userId_sessionId: {
        userId,
        sessionId,
      },
    },
    update: {},
    create: {
      userId,
      sessionId,
    },
  });

  return participant;
}

export async function getSession(sessionId: string) {

  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  })

  return session;

}
