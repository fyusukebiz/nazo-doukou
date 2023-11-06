import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";
import { EventLocations } from "@/features/event_locations/list/EventLocations";

const EventLocationsPage: NextPageWithLayout = () => {
  return <EventLocations />;
};

EventLocationsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventLocationsPage;
