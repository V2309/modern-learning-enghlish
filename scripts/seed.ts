import { PrismaClient, PartOfSpeech } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function mapPartOfSpeech(pos: string): PartOfSpeech {
  const lower = pos.toLowerCase().trim();
  if (lower === "n" || lower === "noun") return PartOfSpeech.Noun;
  if (lower === "v" || lower === "verb") return PartOfSpeech.Verb;
  if (lower === "adj" || lower === "adjective") return PartOfSpeech.Adjective;
  if (lower === "adv" || lower === "adverb") return PartOfSpeech.Adverb;
  if (lower === "phrase") return PartOfSpeech.Phrase;
  return PartOfSpeech.Other;
}

function extractPartOfSpeech(header: string): PartOfSpeech {
  const match = header.match(/\(([^)]+)\)/);
  if (!match) return PartOfSpeech.Other;
  return mapPartOfSpeech(match[1]);
}

function extractPronunciation(header: string): string | undefined {
  const match = header.match(/\/([^/]+)\//);
  return match ? `/${match[1]}/` : undefined;
}

function extractWord(header: string): string {
  return header.split("(")[0].trim();
}

interface VocabEntry {
  word: string;
  partOfSpeech: PartOfSpeech;
  pronunciation?: string;
  meaning: string;
  definition: string;
  examples: string[];
}

function parseVocabFile(filePath: string): VocabEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  const entries: VocabEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    const isWordHeader =
      line.length > 0 &&
      /\((n|v|adj|adv|adj\/n|adv\/adj|phrase)\)/i.test(line) &&
      !line.startsWith("•") &&
      !line.startsWith("-");

    if (!isWordHeader) {
      i++;
      continue;
    }

    const word = extractWord(line);
    const partOfSpeech = extractPartOfSpeech(line);
    const pronunciation = extractPronunciation(line);

    i++;
    while (
      i < lines.length &&
      (lines[i].trim() === "UK" || lines[i].trim() === "US" || lines[i].trim() === "")
    ) {
      i++;
    }

    let meaning = "";
    let definition = "";

    if (i < lines.length && lines[i].trim() === "Định nghĩa:") {
      i++;
      const meaningLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "Ví dụ:" &&
        !lines[i].trim().startsWith("=") &&
        lines[i].trim() !== ""
      ) {
        meaningLines.push(lines[i].trim());
        i++;
      }
      meaning = meaningLines.join("; ");

      if (i < lines.length && lines[i].trim().startsWith("=")) {
        definition = lines[i].trim().substring(1).trim();
        i++;
      }
    }

    while (i < lines.length && lines[i].trim() !== "Ví dụ:") {
      const currentLine = lines[i].trim();
      if (currentLine.startsWith("=")) {
        definition = currentLine.substring(1).trim();
      }
      i++;
    }

    if (i < lines.length && lines[i].trim() === "Ví dụ:") {
      i++;
    }

    const examples: string[] = [];
    while (i < lines.length) {
      const exLine = lines[i].trim();
      if (exLine === "") {
        i++;
        break;
      }
      if (exLine === "UK" || exLine === "US") {
        break;
      }
      if (/\((n|v|adj|adv|adj\/n|adv\/adj|phrase)\)/i.test(exLine) && !exLine.startsWith("•")) {
        break;
      }

      const sentenceMatch = exLine.match(/^•?\s*(.*?)\s*\(=Dịch:/);
      if (sentenceMatch) {
        const sentence = sentenceMatch[1].replace(/\[([^\]]+)\]/g, "$1").trim();
        if (sentence.length > 5) examples.push(sentence);
      } else if (exLine.length > 10) {
        const rawSentence = exLine
          .replace(/\(=Dịch:.*?\)/g, "")
          .replace(/\[([^\]]+)\]/g, "$1")
          .replace(/^•\s*/, "")
          .trim();
        if (rawSentence.length > 5) {
          examples.push(rawSentence);
        }
      }
      i++;
    }

    if (word) {
      entries.push({
        word,
        partOfSpeech,
        pronunciation,
        meaning: meaning || definition || "See definition",
        definition,
        examples,
      });
    }
  }

  return entries;
}

async function main() {
  console.log("🚀 Starting seed for List 9...");

  const filePath = path.join(process.cwd(), "list.txt");

  if (!fs.existsSync(filePath)) {
    console.error("❌ File not found:", filePath);
    process.exit(1);
  }

  const entries = parseVocabFile(filePath);
  console.log(`📖 Parsed ${entries.length} vocabulary entries`);

  entries.forEach((entry, index) => {
    console.log(`  [${index + 1}] ${entry.word} (${entry.partOfSpeech}) - ${entry.meaning}`);
  });

  const existingTopic = await prisma.topic.findFirst({
    where: { name: "List 9" },
  });

  let topicId: string;

  if (existingTopic) {
    console.log(`\n⚠️  Topic "List 9" already exists (id: ${existingTopic.id}). Using existing.`);
    topicId = existingTopic.id;
  } else {
    const topic = await prisma.topic.create({
      data: {
        id: `topic-${Date.now()}`,
        name: "List 9",
        description: "Vocabulary List 9 - imported from list.txt",
      },
    });
    topicId = topic.id;
    console.log(`\n✅ Created topic "List 9" with id: ${topicId}`);
  }

  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const existing = await prisma.vocabulary.findFirst({
      where: {
        topicId,
        word: { equals: entry.word, mode: "insensitive" },
      },
    });

    const exampleString = entry.examples.join("\n");

    if (existing) {
      await prisma.vocabulary.update({
        where: { id: existing.id },
        data: {
          definition: entry.definition || undefined,
          meaning: entry.meaning,
          example: exampleString,
          pronunciation: entry.pronunciation,
        },
      });
      console.log(`  🔄 Updated: "${entry.word}" with definition`);
      skipped++;
      continue;
    }

    await prisma.vocabulary.create({
      data: {
        id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        topicId,
        word: entry.word,
        meaning: entry.meaning,
        definition: entry.definition || undefined,
        example: exampleString,
        category: "General",
        partOfSpeech: entry.partOfSpeech,
        pronunciation: entry.pronunciation,
      },
    });

    console.log(`  ✅ Added: "${entry.word}" (${entry.partOfSpeech})`);
    created++;

    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  console.log("\n🎉 Done!");
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total parsed: ${entries.length}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});