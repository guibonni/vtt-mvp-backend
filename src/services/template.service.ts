import { prisma } from "../config/prisma";

function getTemplateSelect() {
  return {
    id: true,
    name: true,
    data: true,
    createdAt: true,
    createdBy: {
      select: {
        id: true,
        name: true,
      },
    },
  } as const;
}

export async function createTemplate(name: string, data: any, userId: string) {
  return prisma.template.create({
    data: {
      name,
      data,
      createdById: userId,
    },
    select: getTemplateSelect(),
  });
}

export async function listTemplates(name?: string, userId?: string) {
  return prisma.template.findMany({
    where: {
      ...(name
        ? {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }
        : {}),
      ...(userId ? { createdById: userId } : {}),
    },
    select: getTemplateSelect(),
  });
}

export async function getTemplateById(templateId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: getTemplateSelect(),
  });

  if (!template) {
    throw new Error("Template nÃ£o encontrado");
  }

  return template;
}

export async function updateTemplate(
  templateId: string,
  name: string,
  data: any,
  userId: string,
) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: {
      createdById: true,
    },
  });

  if (!template) {
    throw new Error("Template nÃ£o encontrado");
  }

  if (template.createdById !== userId) {
    throw new Error("UsuÃ¡rio nÃ£o pode alterar este template");
  }

  return prisma.template.update({
    where: { id: templateId },
    data: {
      name,
      data,
    },
    select: getTemplateSelect(),
  });
}

export async function deleteTemplate(templateId: string, userId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: {
      createdById: true,
    },
  });

  if (!template) {
    throw new Error("Template nÃ£o encontrado");
  }

  if (template.createdById !== userId) {
    throw new Error("UsuÃ¡rio nÃ£o pode excluir este template");
  }

  await prisma.template.delete({
    where: { id: templateId },
  });

  return true;
}
