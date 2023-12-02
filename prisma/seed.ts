import { PrismaClient } from "@prisma/client";
import prefecturesCities from "./prefectures_cities.json";

function generateRandomDate(from: Date, to: Date) {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime())
  );
}

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
  const chiba = await prisma.prefecture.findFirstOrThrow({
    where: { name: "千葉県" },
  });
  const saitama = await prisma.prefecture.findFirstOrThrow({
    where: { name: "埼玉県" },
  });

  for (const area of [
    "秋葉原",
    "浅草",
    "上野",
    "渋谷",
    "新宿",
    "池袋",
    "原宿",
    "下北沢",
    "吉祥寺",
    "町田",
    "後楽園",
    "お台場",
    "その他",
  ]) {
    await prisma.location.create({
      data: { prefectureId: tokyo.id, name: "全域" },
    });
  }

  for (const area of ["全域"]) {
    await prisma.location.create({
      data: { prefectureId: chiba.id, name: "全域" },
    });
  }

  for (const area of ["全域"]) {
    await prisma.location.create({
      data: { prefectureId: saitama.id, name: "全域" },
    });
  }

  for (const area of ["横浜", "その他"]) {
    await prisma.location.create({
      data: { prefectureId: kanagawa.id, name: "全域" },
    });
  }

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
    "わいわい楽しく🎉",
    "原作知らなくてもOK👌",
  ];
  for (const recruitTag of recruitTags) {
    await prisma.recruitTag.create({ data: { name: recruitTag } });
  }

  const akihabara = await prisma.location.findFirstOrThrow({
    where: { name: "秋葉原" },
  });

  const asakusa = await prisma.location.findFirstOrThrow({
    where: { name: "浅草" },
  });

  for (const index of [...Array(16)].map((_, i) => i)) {
    const event = await prisma.event.create({
      data: {
        name: `test${index}`,
      },
    });

    await prisma.eventLocation.create({
      data: {
        eventId: event.id,
        locationId: akihabara.id,
        dateType: "RANGE",
        startedAt: generateRandomDate(
          new Date(2023, 11, 1),
          new Date(2023, 11, 5)
        ),
        endedAt: generateRandomDate(
          new Date(2023, 11, 6),
          new Date(2023, 11, 10)
        ),
      },
    });

    await prisma.eventLocation.create({
      data: {
        eventId: event.id,
        locationId: asakusa.id,
        dateType: "RANGE",
        startedAt: generateRandomDate(
          new Date(2023, 11, 1),
          new Date(2023, 11, 5)
        ),
        endedAt: generateRandomDate(
          new Date(2023, 11, 6),
          new Date(2023, 11, 10)
        ),
      },
    });
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
