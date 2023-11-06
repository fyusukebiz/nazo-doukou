import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";
import { EventLocation } from "@/features/event_locations/detail/EventLocation";

const EventLocationPage: NextPageWithLayout = () => {
  return <EventLocation />;
};

EventLocationPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventLocationPage;
