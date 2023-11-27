import { EventLocation } from "@/features/event_locations/detail/EventLocation";
import { generateReadSignedUrl } from "@/libs/cloudStorage";
import prisma from "@/libs/prisma";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const eventLocationId = query.id as string;

  const eventLocation = await prisma.eventLocation.findUniqueOrThrow({
    where: { id: eventLocationId },
    include: { event: true },
  });

  const coverImageFileUrl = eventLocation.event.coverImageFileKey
    ? await generateReadSignedUrl(eventLocation.event.coverImageFileKey)
    : undefined;

  const name = eventLocation.event.name;

  // 下の情報は、_app.tsxで使う
  return { props: { event: { name, coverImageFileUrl } } };
};

export default function EventLocationPage() {
  return <EventLocation />;
}
