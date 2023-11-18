import { Recruit } from "@/features/recruits/detail/Recruit";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import prisma from "@/libs/prisma";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const recruitId = query.id as string;

  const recruit = await prisma.recruit.findUniqueOrThrow({
    where: { id: recruitId },
    include: { eventLocation: { include: { event: true } } },
  });

  const coverImageFileUrl = recruit.eventLocation?.event.coverImageFileKey
    ? await generateReadSignedUrl(recruit.eventLocation.event.coverImageFileKey)
    : undefined;

  const name = recruit.manualEventName
    ? recruit.manualEventName
    : recruit.eventLocation!.event.name;

  // 下の情報は、_app.tsxで使う
  return { props: { event: { name, coverImageFileUrl } } };
};

export default function RecruitPage() {
  return <Recruit />;
}
