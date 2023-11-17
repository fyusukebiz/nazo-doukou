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

  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "秋葉原" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "浅草" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "上野" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "渋谷" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "新宿" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "原宿" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "下北沢" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "吉祥寺" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "町田" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "お台場" },
  });
  await prisma.location.create({
    data: { prefectureId: tokyo.id, name: "その他" },
  });

  await prisma.location.create({
    data: { prefectureId: kanagawa.id, name: "横浜" },
  });
  await prisma.location.create({
    data: { prefectureId: kanagawa.id, name: "その他" },
  });

  const gameTypes = [
    "ルーム型",
    "ホール型",
    "周遊型",
    "上海型",
    "ホテル謎",
    "持ち帰りキット",
    "オンライン謎",
    "マダミス",
    "ボドゲ",
    "ポーカー",
  ];
  for (const gameType of gameTypes) {
    await prisma.gameType.create({ data: { name: gameType } });
  }

  const strongAreas = [
    "大謎",
    "小謎",
    "探索",
    "推理",
    "ひらめき",
    "論理",
    "記憶",
    "計算",
    "パズル",
    "情報整理",
  ];

  for (const strongArea of strongAreas) {
    await prisma.strongArea.create({ data: { name: strongArea } });
  }

  const recruitTags = [
    "初心者です🔰",
    "初心者歓迎🙌",
    // "ゆるく楽しみたいです",
    // "本気でクリア目指してます",
    "わいわい楽しく🎉",
    "原作知らなくてもOK👌",
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
