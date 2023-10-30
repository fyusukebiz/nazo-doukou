import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/general/layout/Layout";
import { Event } from "@/features/events/detail/Event";

const EventPage: NextPageWithLayout = () => {
  return <Event />;
};

EventPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventPage;
