import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/general/layout/Layout";
import { EventLocationEvent } from "@/features/event_location_events/detail/EventLocationEvent";

const EventLocationEventPage: NextPageWithLayout = () => {
  return <EventLocationEvent />;
};

EventLocationEventPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventLocationEventPage;
