import { prisma } from "../config/prisma";

export async function createCharacter(
  name: string,
  template: string,
  data: any,
  userId: string,
  sessionId: string,
) {
  const character = await prisma.character.create({
    data: {
      name,
      template,
      data,
      userId,
      sessionId,
    },
  });

  return character;
}

export async function getSessionCharacters(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { createdById: true },
  });

  if (!session) {
    throw new Error("Sessão não encontrada");
  }

  const isSessionCreator = session.createdById === userId;

  const characters = await prisma.character.findMany({
    where: isSessionCreator ? { sessionId } : { sessionId, userId },
    select: {
      id: true,
      name: true,
      template: true,
      data: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return characters;
}

export async function updateCharacter(
  characterId: string,
  sessionId: string,
  data: any,
) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character || character.sessionId !== sessionId) {
    throw new Error("Personagem não pertence à sessão");
  }

  return prisma.character.update({
    where: { id: characterId },
    data: { data },
  });
}

export async function deleteCharacter(characterId: string, sessionId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character || character.sessionId !== sessionId) {
    throw new Error("Personagem não pertence à sessão");
  }
  
  await prisma.character.delete({
    where: { id: characterId },
  });

  return true;
}
