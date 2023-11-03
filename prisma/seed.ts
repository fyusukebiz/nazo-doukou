import { PrismaClient } from "@prisma/client";
import prefecturesCities from "./prefectures_cities.json";

const prisma = new PrismaClient();

async function main() {
  // 都道府県
  for (const [index, prefectureCities] of Object.entries(prefecturesCities)) {
    await prisma.prefecture.create({
      data: { name: prefectureCities.name, sort: Number(index) + 1 },
    });
  }

  const tokyo = await prisma.prefecture.findFirstOrThrow({
    where: { name: "東京都" },
  });
  const kanagawa = await prisma.prefecture.findFirstOrThrow({
    where: { name: "神奈川県" },
  });

  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "秋葉原" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "浅草" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "上野" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "渋谷" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "新宿" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "下北沢" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "吉祥寺" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "町田" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "お台場" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: tokyo.id, name: "その他" },
  });

  await prisma.eventLocation.create({
    data: { prefectureId: kanagawa.id, name: "横浜" },
  });
  await prisma.eventLocation.create({
    data: { prefectureId: kanagawa.id, name: "その他" },
  });

  const gameTypes = [
    "小謎",
    "大謎",
    "周遊型",
    "上海型",
    "ルーム型",
    "ホール型",
    "スタジアム",
    "推理系",
  ];
  for (const gameType of gameTypes) {
    await prisma.gameType.create({ data: { name: gameType } });
  }

  const recruitTags = [
    "初心者です",
    "初心者歓迎",
    "ゆるく楽しみたいです",
    "本気でクリア目指してます",
  ];
  for (const recruitTag of recruitTags) {
    await prisma.recruitTag.create({ data: { name: recruitTag } });
  }
}

console.log("## Start");

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("## End");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
