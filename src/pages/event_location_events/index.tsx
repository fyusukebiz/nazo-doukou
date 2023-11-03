import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/general/layout/Layout";
import { EventLocationEvents } from "@/features/event_location_events/list/EventLocationEvents";

const EventLocationEventsPage: NextPageWithLayout = () => {
  return <EventLocationEvents />;
};

EventLocationEventsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventLocationEventsPage;
