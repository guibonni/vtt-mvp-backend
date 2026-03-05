import { prisma } from "../config/prisma"

export async function createMessage(
  content: string,
  type: "TEXT" | "DICE",
  diceData: any,
  userId: string,
  sessionId: string
) {

  const message = await prisma.message.create({
    data: {
      content,
      type,
      diceData,
      userId,
      sessionId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return message
}

export async function getSessionMessages(sessionId: string) {

  return prisma.message.findMany({
    where: { sessionId },
    orderBy: {
      createdAt: "asc"
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}