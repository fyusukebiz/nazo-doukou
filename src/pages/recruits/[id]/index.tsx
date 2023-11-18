import { Recruit } from "@/features/recruits/detail/Recruit";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import prisma from "@/libs/prisma";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

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

  console.log("recruit", recruit);
  console.log("coverImageFileUrl", coverImageFileUrl);
  console.log("name", name);

  return { props: { event: { name, coverImageFileUrl } } };
};

type Props = {
  event: {
    name: string;
    coverImageFileUrl?: string;
  };
};

export default function RecruitPage({ event }: Props) {
  return (
    <>
      <NextSeo
        openGraph={{
          title: event.name,
          ...(event.coverImageFileUrl && {
            images: [
              {
                url: event.coverImageFileUrl,
                alt: event.name,
              },
            ],
          }),
        }}
      />
      <Recruit />
    </>
  );
}
