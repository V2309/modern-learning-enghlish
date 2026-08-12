import prisma from "@/lib/db";

export async function getShadowingVideos() {
  return await prisma.shadowingVideo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdByUser: {
        select: {
          uid: true,
          name: true,
          email: true,
        }
      }
    }
  });
}

export async function getShadowingVideoById(id: string) {
  return await prisma.shadowingVideo.findUnique({
    where: { id },
    include: {
      createdByUser: {
        select: {
          uid: true,
          name: true,
          email: true,
        }
      }
    }
  });
}

export async function createShadowingVideo(data: {
  title: string;
  description?: string;
  videoUrl: string;
  transcript: string;
  createdByUserId: string;
}) {
  const id = `shadowing-${Date.now()}`;
  return await prisma.shadowingVideo.create({
    data: {
      id,
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      transcript: data.transcript,
      createdByUserId: data.createdByUserId
    }
  });
}

export async function updateShadowingVideo(id: string, data: {
  title?: string;
  description?: string;
  videoUrl?: string;
  transcript?: string;
}) {
  return await prisma.shadowingVideo.update({
    where: { id },
    data
  });
}

export async function deleteShadowingVideo(id: string) {
  return await prisma.shadowingVideo.delete({
    where: { id }
  });
}

export async function getShadowingProgress(userId: string, videoId: string) {
  return await prisma.shadowingProgress.findUnique({
    where: {
      uniqueUserShadowingProgress: { userId, videoId }
    }
  });
}

export async function toggleShadowingProgress(userId: string, videoId: string, completed: boolean) {
  const existing = await prisma.shadowingProgress.findUnique({
    where: {
      uniqueUserShadowingProgress: { userId, videoId }
    }
  });

  if (completed) {
    if (!existing) {
      await prisma.shadowingProgress.create({
        data: {
          id: `sp-${Date.now()}`,
          userId,
          videoId
        }
      });
    }
  } else {
    if (existing) {
      await prisma.shadowingProgress.delete({
        where: { id: existing.id }
      });
    }
  }
}

export async function getUserShadowingProgress(userId: string) {
  return await prisma.shadowingProgress.findMany({
    where: { userId }
  });
}
