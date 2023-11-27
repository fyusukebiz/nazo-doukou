import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";
import { Recruits } from "@/features/recruits/list/Recruits";

const RecruitsPage: NextPageWithLayout = () => {
  return <Recruits />;
};

RecruitsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default RecruitsPage;
