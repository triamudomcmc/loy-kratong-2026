import { existsSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env")) process.loadEnvFile(".env");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function readWords(file: string): string[] {
  if (!existsSync(file)) {
    console.log(`skip: ${file} not found`);
    return [];
  }
  return [...new Set(readFileSync(file, "utf8").split(/\s+/).filter(Boolean))];
}

async function main() {
  const blocked = readWords("data/blocklist.txt");
  if (blocked.length) {
    const r = await prisma.blockedWord.createMany({ data: blocked.map((word) => ({ word })), skipDuplicates: true });
    console.log(`blocked words: ${r.count} inserted`);
  }
  const dict = readWords("data/dictionary.txt");
  if (dict.length) {
    const r = await prisma.dictionaryWord.createMany({ data: dict.map((word) => ({ word })), skipDuplicates: true });
    console.log(`dictionary words: ${r.count} inserted`);
  }

  if (process.env.SEED_SAMPLE === "1") {
    const principal = { base: "base-blue", swan: "swan-pink", candles: "candle-green", decorations: "rice2" };
    await prisma.specialKratong.upsert({
      where: { id: "sample-principal" },
      create: { id: "sample-principal", kind: "PRINCIPAL", kratong: principal, wishName: "Sample", wishContent: "Sample wish" },
      update: {},
    });
    const standard = { base: "banana-leaf", candles: "candle-yellow", decorations: "swan", flowers: "luck", signVariant: 0 };
    for (let i = 1; i <= 10; i++) {
      await prisma.kratong.upsert({
        where: { sourceId: `sample-${i}` },
        create: {
          sourceId: `sample-${i}`,
          kind: "STANDARD",
          status: "DISPLAYED",
          kratong: { ...standard, signVariant: i % 3 },
          wishName: `sample ${i}`,
          wishContent: `sample wish ${i}`,
        },
        update: {},
      });
    }
    console.log("sample data seeded");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
