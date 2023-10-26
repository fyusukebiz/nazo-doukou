import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/general/layout/Layout";

const EventsPage: NextPageWithLayout = () => {
  return <div>test</div>;
};

EventsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventsPage;
