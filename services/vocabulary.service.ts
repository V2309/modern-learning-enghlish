import prisma from "@/lib/db";
import { PartOfSpeech } from "@prisma/client";

export function mapVocabulary(vocab: any) {
  if (!vocab) return null;
  const rawExample = vocab.example || "";
  const examples = rawExample ? rawExample.split("\n") : [];
  return {
    ...vocab,
    examples,
    example: examples[0] || ""
  };
}

export async function getVocabulary() {
  const list = await prisma.vocabulary.findMany({
    orderBy: { createdAt: "desc" }
  });
  return list.map(mapVocabulary);
}

export async function getVocabularyById(vocabularyId: string) {
  const item = await prisma.vocabulary.findUnique({
    where: { id: vocabularyId }
  });
  return mapVocabulary(item);
}

export async function getVocabularyByTopic(topicId: string) {
  const list = await prisma.vocabulary.findMany({
    where: { topicId },
    orderBy: { createdAt: "asc" }
  });
  return list.map(mapVocabulary);
}

export async function searchVocabulary(keyword: string) {
  const list = await prisma.vocabulary.findMany({
    where: {
      OR: [
        { word: { contains: keyword, mode: "insensitive" } },
        { meaning: { contains: keyword, mode: "insensitive" } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
  return list.map(mapVocabulary);
}

export async function createVocabulary(data: {
  topicId: string;
  word: string;
  meaning: string;
  example?: string;
  examples?: string[];
  category: string;
  partOfSpeech: PartOfSpeech;
  pronunciation?: string;
  imageUrl?: string;
  createdByUserId?: string;
}) {
  const id = `vocab-${Date.now()}`;
  const exampleString = data.examples && data.examples.length > 0 
    ? data.examples.filter(e => e.trim() !== "").join("\n") 
    : data.example || "";

  const item = await prisma.vocabulary.create({
    data: {
      id,
      topicId: data.topicId,
      word: data.word,
      meaning: data.meaning,
      example: exampleString,
      category: data.category,
      partOfSpeech: data.partOfSpeech,
      pronunciation: data.pronunciation,
      imageUrl: data.imageUrl,
      createdByUserId: data.createdByUserId
    }
  });
  return mapVocabulary(item);
}

export async function updateVocabulary(vocabularyId: string, data: {
  topicId?: string;
  word?: string;
  meaning?: string;
  example?: string;
  examples?: string[];
  category?: string;
  partOfSpeech?: PartOfSpeech;
  pronunciation?: string;
  imageUrl?: string;
}) {
  let exampleString = data.example;
  if (data.examples) {
    exampleString = data.examples.filter(e => e.trim() !== "").join("\n");
  }

  const updateData: any = { ...data };
  if (exampleString !== undefined) {
    updateData.example = exampleString;
    delete updateData.examples;
  }

  const item = await prisma.vocabulary.update({
    where: { id: vocabularyId },
    data: updateData
  });
  return mapVocabulary(item);
}

export async function deleteVocabulary(vocabularyId: string) {
  const item = await prisma.vocabulary.delete({
    where: { id: vocabularyId }
  });
  return mapVocabulary(item);
}
