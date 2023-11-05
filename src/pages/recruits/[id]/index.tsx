import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";

const RecruitPage: NextPageWithLayout = () => {
  return <div>test</div>;
};

RecruitPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default RecruitPage;
