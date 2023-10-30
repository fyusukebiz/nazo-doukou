import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/general/layout/Layout";
import { Events } from "@/features/events/list/Events";

const EventsPage: NextPageWithLayout = () => {
  return <Events />;
};

EventsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventsPage;
