import prisma from "@/lib/db";

export async function getTopics() {
  return await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vocabularies: {
        select: { id: true }
      }
    }
  });
}

export async function getTopicById(topicId: string) {
  return await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      vocabularies: true
    }
  });
}

export async function createTopic(data: { name: string; description?: string; createdByUserId?: string }) {
  const id = `topic-${Date.now()}`;
  return await prisma.topic.create({
    data: {
      id,
      name: data.name,
      description: data.description,
      createdByUserId: data.createdByUserId
    }
  });
}

export async function updateTopic(topicId: string, data: { name?: string; description?: string }) {
  return await prisma.topic.update({
    where: { id: topicId },
    data
  });
}

export async function deleteTopic(topicId: string) {
  return await prisma.topic.delete({
    where: { id: topicId }
  });
}
